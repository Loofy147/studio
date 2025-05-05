
'use client' // Error components must be Client Components

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { XCircle, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function StoreManageError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error)
  }, [error])

  return (
     <div className="container mx-auto py-10 flex flex-col items-center justify-center min-h-[60vh]">
        <Alert variant="destructive" className="max-w-lg w-full text-center">
            <XCircle className="h-6 w-6 mx-auto mb-3" />
            <AlertTitle className="text-xl font-semibold mb-2">Oops! Something went wrong</AlertTitle>
            <AlertDescription className="mb-6">
                {error.message || "We encountered an error while loading the store management page."}
            </AlertDescription>
            <div className="flex justify-center gap-4">
                <Button
                    onClick={
                    // Attempt to recover by trying to re-render the segment
                    () => reset()
                    }
                    variant="secondary"
                >
                    Try again
                </Button>
                <Link href="/stores" passHref>
                     <Button variant="outline">
                        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Your Stores
                    </Button>
                </Link>
            </div>
        </Alert>
    </div>
  )
}
