import { Heading } from '@/components/atoms/Heading/Heading'

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-white px-4 py-12 text-center text-neutral-800">
      <p className="text-sm font-medium uppercase tracking-widest text-neutral-500">
        404
      </p>
      <Heading level={1} className="text-3xl font-semibold sm:text-4xl">
        Page not found
      </Heading>
      <p className="max-w-md text-balance text-neutral-600">
        We couldn&apos;t find the page you were looking for. Check the URL or
        head back to the homepage.
      </p>
    </main>
  )
}
