/* eslint-disable */

// @ts-nocheck

// noinspection JSUnusedGlobalSymbols

// This file was automatically generated by TanStack Router.
// You should NOT make any changes in this file as it will be overwritten.
// Additionally, you should also exclude this file from your linter and/or formatter to prevent it from being checked or modified.

import { createFileRoute } from '@tanstack/react-router'

// Import Routes

import { Route as rootRoute } from './routes/__root'

// Create Virtual Routes

const JournalLazyImport = createFileRoute('/journal')()
const DocumentsLazyImport = createFileRoute('/documents')()
const IndexLazyImport = createFileRoute('/')()

// Create/Update Routes

const JournalLazyRoute = JournalLazyImport.update({
  id: '/journal',
  path: '/journal',
  getParentRoute: () => rootRoute,
} as any).lazy(() => import('./routes/journal.lazy').then((d) => d.Route))

const DocumentsLazyRoute = DocumentsLazyImport.update({
  id: '/documents',
  path: '/documents',
  getParentRoute: () => rootRoute,
} as any).lazy(() => import('./routes/documents.lazy').then((d) => d.Route))

const IndexLazyRoute = IndexLazyImport.update({
  id: '/',
  path: '/',
  getParentRoute: () => rootRoute,
} as any).lazy(() => import('./routes/index.lazy').then((d) => d.Route))

// Populate the FileRoutesByPath interface

declare module '@tanstack/react-router' {
  interface FileRoutesByPath {
    '/': {
      id: '/'
      path: '/'
      fullPath: '/'
      preLoaderRoute: typeof IndexLazyImport
      parentRoute: typeof rootRoute
    }
    '/documents': {
      id: '/documents'
      path: '/documents'
      fullPath: '/documents'
      preLoaderRoute: typeof DocumentsLazyImport
      parentRoute: typeof rootRoute
    }
    '/journal': {
      id: '/journal'
      path: '/journal'
      fullPath: '/journal'
      preLoaderRoute: typeof JournalLazyImport
      parentRoute: typeof rootRoute
    }
  }
}

// Create and export the route tree

export interface FileRoutesByFullPath {
  '/': typeof IndexLazyRoute
  '/documents': typeof DocumentsLazyRoute
  '/journal': typeof JournalLazyRoute
}

export interface FileRoutesByTo {
  '/': typeof IndexLazyRoute
  '/documents': typeof DocumentsLazyRoute
  '/journal': typeof JournalLazyRoute
}

export interface FileRoutesById {
  __root__: typeof rootRoute
  '/': typeof IndexLazyRoute
  '/documents': typeof DocumentsLazyRoute
  '/journal': typeof JournalLazyRoute
}

export interface FileRouteTypes {
  fileRoutesByFullPath: FileRoutesByFullPath
  fullPaths: '/' | '/documents' | '/journal'
  fileRoutesByTo: FileRoutesByTo
  to: '/' | '/documents' | '/journal'
  id: '__root__' | '/' | '/documents' | '/journal'
  fileRoutesById: FileRoutesById
}

export interface RootRouteChildren {
  IndexLazyRoute: typeof IndexLazyRoute
  DocumentsLazyRoute: typeof DocumentsLazyRoute
  JournalLazyRoute: typeof JournalLazyRoute
}

const rootRouteChildren: RootRouteChildren = {
  IndexLazyRoute: IndexLazyRoute,
  DocumentsLazyRoute: DocumentsLazyRoute,
  JournalLazyRoute: JournalLazyRoute,
}

export const routeTree = rootRoute
  ._addFileChildren(rootRouteChildren)
  ._addFileTypes<FileRouteTypes>()

/* ROUTE_MANIFEST_START
{
  "routes": {
    "__root__": {
      "filePath": "__root.tsx",
      "children": [
        "/",
        "/documents",
        "/journal"
      ]
    },
    "/": {
      "filePath": "index.lazy.tsx"
    },
    "/documents": {
      "filePath": "documents.lazy.tsx"
    },
    "/journal": {
      "filePath": "journal.lazy.tsx"
    }
  }
}
ROUTE_MANIFEST_END */
