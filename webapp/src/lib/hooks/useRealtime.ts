"use client"

import { useEffect, useRef } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useSession } from 'next-auth/react'
import { toast } from 'sonner'
import { fetchEventSource } from '@microsoft/fetch-event-source'

export function useRealtime() {
  const queryClient = useQueryClient()
  const { data: session, status } = useSession()
  const abortControllerRef = useRef<AbortController | null>(null)

  useEffect(() => {
    // Check if SSE is enabled
    if (process.env.NEXT_PUBLIC_ENABLE_SSE !== 'true') {
      console.log('🔕 SSE disabled via environment variable')
      return
    }

    // Wait for authentication
    if (status === 'loading') {
      console.log('⏳ Waiting for authentication...')
      return
    }

    if (status === 'unauthenticated' || !session?.accessToken) {
      console.log('🔒 No authentication token, skipping SSE')
      return
    }

    // Check if we're in browser
    if (typeof window === 'undefined') {
      return
    }

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
    const sseUrl = `${apiUrl}/api/v1/sse/updates`

    console.log('🔌 Establishing SSE connection to:', sseUrl)

    // Create abort controller for cleanup
    abortControllerRef.current = new AbortController()

    // Connect to SSE endpoint
    const connectSSE = async () => {
      try {
        await fetchEventSource(sseUrl, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${session.accessToken}`,
            'Accept': 'text/event-stream',
          },
          signal: abortControllerRef.current?.signal,
          
          async onopen(response) {
            if (response.ok) {
              console.log('✅ SSE connection established')
              return
            }
            
            if (response.status === 401) {
              console.error('❌ SSE authentication failed')
              throw new Error('Authentication failed')
            }
            
            throw new Error(`SSE connection failed: ${response.status}`)
          },
          
          onmessage(event) {
            // Handle different event types
            switch (event.event) {
              case 'case_synced':
                handleCaseSynced(event.data)
                break
              
              case 'document_uploaded':
                handleDocumentUploaded(event.data)
                break
              
              case 'analysis_completed':
                handleAnalysisCompleted(event.data)
                break
              
              case 'ping':
                // Keepalive - do nothing
                break
              
              case 'error':
                console.warn('⚠️ SSE error event:', event.data)
                break
              
              default:
                console.log('📥 SSE event:', event.event, event.data)
            }
          },
          
          onerror(err) {
            console.error('❌ SSE connection error:', err)
            // fetchEventSource will automatically retry with exponential backoff
            throw err
          },
          
          onclose() {
            console.log('🔌 SSE connection closed')
          },
          
          // Retry configuration
          openWhenHidden: false, // Don't reconnect when tab is hidden
        })
      } catch (error) {
        if (error instanceof Error && error.name === 'AbortError') {
          console.log('🛑 SSE connection aborted')
        } else {
          console.error('💥 SSE connection failed:', error)
        }
      }
    }

    // Start connection
    connectSSE()

    // Cleanup function
    return () => {
      console.log('🧹 Cleaning up SSE connection')
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
        abortControllerRef.current = null
      }
    }

    // Event handlers
    function handleCaseSynced(data: string) {
      try {
        const parsed = JSON.parse(data)
        console.log('📋 Case synced:', parsed.case_number)
        
        // Invalidate cache to trigger refetch
        queryClient.invalidateQueries({ queryKey: ['cases'] })
        queryClient.invalidateQueries({ queryKey: ['case-stats'] })
        queryClient.invalidateQueries({ queryKey: ['upcoming-hearings'] })
        
        // Show notification
        toast.success(`New case synced`, {
          description: parsed.case_number,
          duration: 5000,
        })
      } catch (err) {
        console.error('Error parsing case_synced event:', err)
      }
    }

    function handleDocumentUploaded(data: string) {
      try {
        const parsed = JSON.parse(data)
        console.log('📄 Document uploaded:', parsed.title)
        
        // Invalidate documents cache
        queryClient.invalidateQueries({ queryKey: ['documents', parsed.case_id] })
        queryClient.invalidateQueries({ queryKey: ['case', parsed.case_id] })
        
        // Show notification
        toast.success(`Document uploaded`, {
          description: parsed.title,
          duration: 5000,
        })
      } catch (err) {
        console.error('Error parsing document_uploaded event:', err)
      }
    }

    function handleAnalysisCompleted(data: string) {
      try {
        const parsed = JSON.parse(data)
        console.log('🤖 AI analysis completed:', parsed.case_id)
        
        // Invalidate analysis cache
        queryClient.invalidateQueries({ queryKey: ['ai-analysis', parsed.case_id] })
        queryClient.invalidateQueries({ queryKey: ['case', parsed.case_id] })
        
        // Show notification
        toast.info(`AI analysis completed`, {
          description: `Check the AI Analysis tab`,
          duration: 5000,
        })
      } catch (err) {
        console.error('Error parsing analysis_completed event:', err)
      }
    }

  }, [queryClient, session, status])
}