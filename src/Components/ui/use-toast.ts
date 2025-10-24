// Simplified version of use-toast
import { useState } from "react"

export interface Toast {
  id: string
  title?: string
  description?: string
  action?: React.ReactNode
}

export interface ToastActionElement {
  altText: string
}

export type ToasterToast = Toast & {
  id: string
  title?: string
  description?: string
  action?: React.ReactNode
}

const TOAST_LIMIT = 5
const TOAST_REMOVE_DELAY = 1000

export type ToastProps = Toast

export const useToast = () => {
  const [toasts, setToasts] = useState<ToasterToast[]>([])

  function toast({ ...props }: Toast) {
    const id = Math.random().toString(36).substring(2, 9)
    const newToast = { ...props, id }
    
    setToasts((prevToasts) => {
      const updatedToasts = [...prevToasts, newToast].slice(-TOAST_LIMIT)
      return updatedToasts
    })

    return {
      id,
      dismiss: () => dismiss(id),
      update: (props: ToastProps) => update(id, props),
    }
  }

  function dismiss(id: string) {
    setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id))
  }

  function update(id: string, props: ToastProps) {
    setToasts((prevToasts) =>
      prevToasts.map((toast) =>
        toast.id === id ? { ...toast, ...props } : toast
      )
    )
  }

  return {
    toast,
    dismiss,
    toasts,
  }
}