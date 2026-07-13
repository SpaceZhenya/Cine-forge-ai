"""
LangGraph-style orchestration pipeline for CineForge AI.

Each node in the graph is an AI agent that transforms the film state
and passes it to the next node. Supports branching, rewrites, and
the "Infinite Movie" mode.
"""

import asyncio
from enum import Enum
from dataclasses import dataclass, field
from typing import Callable, Optional
from shared.types import FilmProject, PipelineStatus


class NodeResult:
    def __init__(self, project: FilmProject, next_nodes: list[str] = None):
        self.project = project
        self.next_nodes = next_nodes or []


NodeFn = Callable[[FilmProject], NodeResult]


@dataclass
class PipelineNode:
    name: str
    status: PipelineStatus
    fn: NodeFn
    retry_count: int = 3


class PipelineGraph:
    def __init__(self):
        self._nodes: dict[str, PipelineNode] = {}
        self._entry_point: str = ""
        self._on_status_change: Optional[Callable] = None

    def add_node(self, name: str, status: PipelineStatus, fn: NodeFn):
        self._nodes[name] = PipelineNode(name=name, status=status, fn=fn)
        if not self._entry_point:
            self._entry_point = name
        return self

    def set_entry_point(self, name: str):
        self._entry_point = name
        return self

    def on_status_change(self, cb: Callable):
        self._on_status_change = cb
        return self

    async def _notify(self, project: FilmProject):
        if self._on_status_change:
            await self._on_status_change(project)

    async def run(self, project: FilmProject) -> FilmProject:
        current = self._entry_point
        visited = set()

        while current and current not in visited:
            visited.add(current)
            node = self._nodes.get(current)
            if not node:
                break

            project.status = node.status
            await self._notify(project)

            for attempt in range(node.retry_count):
                try:
                    loop = asyncio.get_event_loop()
                    result = await loop.run_in_executor(None, node.fn, project)
                    project = result.project
                    break
                except Exception as e:
                    if attempt == node.retry_count - 1:
                        project.status = PipelineStatus.FAILED
                        await self._notify(project)
                        raise
                    await asyncio.sleep(1)

            if result.next_nodes:
                for next_node in result.next_nodes:
                    if next_node not in visited:
                        current = next_node
                        break
                else:
                    current = result.next_nodes[0]
            else:
                current = ""

        project.status = PipelineStatus.COMPLETED
        await self._notify(project)
        return project

    async def run_from_node(self, project: FilmProject, start_node: str) -> FilmProject:
        self._entry_point = start_node
        return await self.run(project)


def create_film_pipeline(
    on_status_change: Optional[Callable] = None
) -> PipelineGraph:
    from .producer import produce_idea
    from .screenwriter import write_script
    from .director import break_down_scenes
    from .storyboard import generate_storyboard
    from .camera import plan_camera
    from .actor import create_emotions
    from .voice import generate_voices
    from .composer import compose_music
    from .editor import assemble_film

    graph = PipelineGraph()
    graph.on_status_change(on_status_change)

    graph.add_node("producer", PipelineStatus.PRODUCING, produce_idea)
    graph.add_node("screenwriter", PipelineStatus.SCREENWRITING, write_script)
    graph.add_node("director", PipelineStatus.DIRECTING, break_down_scenes)
    graph.add_node("storyboard", PipelineStatus.STORYBOARDING, generate_storyboard)
    graph.add_node("camera", PipelineStatus.CAMERA, plan_camera)
    graph.add_node("actor", PipelineStatus.ACTING, create_emotions)
    graph.add_node("voice", PipelineStatus.VOICING, generate_voices)
    graph.add_node("composer", PipelineStatus.COMPOSING, compose_music)
    graph.add_node("editor", PipelineStatus.EDITING, assemble_film)

    graph.set_entry_point("producer")
    return graph
