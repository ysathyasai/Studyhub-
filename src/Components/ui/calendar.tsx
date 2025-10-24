import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "../../lib/utils"

export interface CalendarProps {
  className?: string
  month?: Date
  onMonthChange?: (date: Date) => void
  renderDay?: (day: Date) => React.ReactNode
  weekStartsOn?: 0 | 1 | 2 | 3 | 4 | 5 | 6
}

const Calendar = React.forwardRef<HTMLDivElement, CalendarProps>(
  ({ className, month = new Date(), onMonthChange, renderDay, weekStartsOn = 0, ...props }, ref) => {
    const [currentMonth, setCurrentMonth] = React.useState(month)
    
    const handlePreviousMonth = () => {
      const previousMonth = new Date(currentMonth)
      previousMonth.setMonth(previousMonth.getMonth() - 1)
      setCurrentMonth(previousMonth)
      onMonthChange?.(previousMonth)
    }
    
    const handleNextMonth = () => {
      const nextMonth = new Date(currentMonth)
      nextMonth.setMonth(nextMonth.getMonth() + 1)
      setCurrentMonth(nextMonth)
      onMonthChange?.(nextMonth)
    }
    
    // Generate days for the current month view
    const getDaysInMonth = (date: Date) => {
      const year = date.getFullYear()
      const month = date.getMonth()
      const daysInMonth = new Date(year, month + 1, 0).getDate()
      
      return Array.from({ length: daysInMonth }, (_, i) => new Date(year, month, i + 1))
    }
    
    const days = getDaysInMonth(currentMonth)
    
    return (
      <div
        ref={ref}
        className={cn("w-full p-3", className)}
        {...props}
      >
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={handlePreviousMonth}
            className="p-2 rounded-md hover:bg-gray-100"
            aria-label="Previous month"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <h2 className="font-medium">
            {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </h2>
          <button
            onClick={handleNextMonth}
            className="p-2 rounded-md hover:bg-gray-100"
            aria-label="Next month"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
        
        <div className="grid grid-cols-7 gap-1 mb-2">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, i) => (
            <div key={day} className="text-center text-sm font-medium text-gray-500">
              {day}
            </div>
          ))}
        </div>
        
        <div className="grid grid-cols-7 gap-1">
          {days.map((day) => (
            <div
              key={day.toString()}
              className="aspect-square p-2 flex items-center justify-center rounded-md hover:bg-gray-100"
            >
              {renderDay ? renderDay(day) : day.getDate()}
            </div>
          ))}
        </div>
      </div>
    )
  }
)

Calendar.displayName = "Calendar"

export { Calendar }