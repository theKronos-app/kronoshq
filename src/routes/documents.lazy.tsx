import { createLazyFileRoute } from "@tanstack/react-router";

export const Route = createLazyFileRoute("/documents")({
  component: RouteComponent,
});

function RouteComponent() {
  return <div>Hello "/documents"!</div>;
}
