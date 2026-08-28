import { DotsHorizontalIcon } from '@radix-ui/react-icons'
import { SquarePen, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

type CustomersRowActionsProps = {
  onEdit: () => void
  onDelete: () => void
}

export function CustomersRowActions({
  onEdit,
  onDelete,
}: CustomersRowActionsProps) {
  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button
          variant='ghost'
          className='flex h-8 w-8 p-0 data-[state=open]:bg-muted'
        >
          <DotsHorizontalIcon className='h-4 w-4' />
          <span className='sr-only'>메뉴 열기</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='end' className='w-32'>
        <DropdownMenuItem onClick={onEdit}>
          수정
          <DropdownMenuShortcut>
            <SquarePen size={16} />
          </DropdownMenuShortcut>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={onDelete} className='text-red-500!'>
          삭제
          <DropdownMenuShortcut>
            <Trash2 size={16} />
          </DropdownMenuShortcut>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
