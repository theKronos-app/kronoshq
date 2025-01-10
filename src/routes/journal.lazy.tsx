import EditorComponent from '@/components/editor/editor-component'
import { createLazyFileRoute } from '@tanstack/react-router'

export const Route = createLazyFileRoute('/journal')({
  component: Journal,
})

function Journal() {
  return <div className="p-2">

    <EditorComponent />

  </div>
}
