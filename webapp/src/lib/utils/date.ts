import { format, formatDistance, isToday, isTomorrow, isYesterday, parseISO } from 'date-fns'

export function formatDate(date: string | Date, formatStr: string = 'PPP'): string {
  const dateObj = typeof date === 'string' ? parseISO(date) : date
  return format(dateObj, formatStr)
}

export function formatRelativeDate(date: string | Date): string {
  const dateObj = typeof date === 'string' ? parseISO(date) : date
  
  if (isToday(dateObj)) {
    return `Today at ${format(dateObj, 'p')}`
  }
  
  if (isTomorrow(dateObj)) {
    return `Tomorrow at ${format(dateObj, 'p')}`
  }
  
  if (isYesterday(dateObj)) {
    return `Yesterday at ${format(dateObj, 'p')}`
  }
  
  return formatDistance(dateObj, new Date(), { addSuffix: true })
}

export function getDaysUntil(date: string | Date): number {
  const dateObj = typeof date === 'string' ? parseISO(date) : date
  const now = new Date()
  const diffTime = dateObj.getTime() - now.getTime()
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
}

export function isUpcoming(date: string | Date, days: number = 7): boolean {
  const daysUntil = getDaysUntil(date)
  return daysUntil >= 0 && daysUntil <= days
}