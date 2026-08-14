import { useEffect, useState } from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { ageGroups } from '@/lib/age-groups'
import { updateCustomer } from '@/lib/api/customers'
import { optionalEmailSchema } from '@/lib/email-domains'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { SelectDropdown } from '@/components/select-dropdown'
import { type Customer } from '../data/schema'
import { CustomerEmailInput } from './customer-email-input'

const formSchema = z.object({
  name: z.string().min(1, '이름을 입력해주세요.'),
  ageGroup: z.enum(ageGroups, { error: '연령을 선택해주세요.' }),
  matchedParticipantNo: z.string(),
  address: z.string(),
  email: optionalEmailSchema,
  memo: z.string(),
})

type CustomerEditForm = z.infer<typeof formSchema>

type CustomerEditDialogProps = {
  customer: Customer | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onUpdated: (customer: Customer) => void
}

export function CustomerEditDialog({
  customer,
  open,
  onOpenChange,
  onUpdated,
}: CustomerEditDialogProps) {
  const [isSaving, setIsSaving] = useState(false)
  const form = useForm<CustomerEditForm>({
    resolver: zodResolver(formSchema),
  })

  useEffect(() => {
    if (!customer) return
    form.reset({
      name: customer.name,
      ageGroup: customer.ageGroup ?? undefined,
      matchedParticipantNo: customer.matchedParticipantNo ?? '',
      address: customer.address,
      email: customer.email,
      memo: customer.memo,
    })
  }, [customer, form])

  const onSubmit = async (values: CustomerEditForm) => {
    if (!customer) return

    setIsSaving(true)
    try {
      const updated = await updateCustomer(customer.id, {
        name: values.name.trim(),
        ageGroup: values.ageGroup,
        matchedParticipantNo: values.matchedParticipantNo.trim() || null,
        address: values.address.trim(),
        email: values.email.trim(),
        memo: values.memo.trim(),
      })
      onUpdated(updated)
      onOpenChange(false)
      toast.success('고객 정보를 수정했습니다.')
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : '고객 정보를 수정하지 못했습니다.'
      )
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(state) => {
        if (isSaving) return
        onOpenChange(state)
      }}
    >
      <DialogContent className='sm:max-w-lg'>
        <DialogHeader className='text-start'>
          <DialogTitle>고객 정보 수정</DialogTitle>
          <DialogDescription>
            변경할 내용을 입력한 뒤 저장을 누르세요.
          </DialogDescription>
        </DialogHeader>

        <div className='grid gap-2'>
          <Label>참가번호</Label>
          <Input value={customer?.participantNo ?? ''} disabled />
        </div>

        <Form {...form}>
          <form
            id='customer-edit-form'
            onSubmit={form.handleSubmit(onSubmit)}
            className='space-y-4 px-0.5'
          >
            <FormField
              control={form.control}
              name='name'
              render={({ field }) => (
                <FormItem className='grid gap-2 space-y-0'>
                  <FormLabel>이름</FormLabel>
                  <FormControl>
                    <Input autoComplete='off' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='ageGroup'
              render={({ field }) => (
                <FormItem className='grid gap-2 space-y-0'>
                  <FormLabel>연령</FormLabel>
                  <SelectDropdown
                    defaultValue={field.value}
                    onValueChange={field.onChange}
                    placeholder='연령대를 선택하세요'
                    isControlled
                    items={ageGroups.map((group) => ({
                      label: group,
                      value: group,
                    }))}
                  />
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='matchedParticipantNo'
              render={({ field }) => (
                <FormItem className='grid gap-2 space-y-0'>
                  <FormLabel>매칭상대 참가번호</FormLabel>
                  <FormControl>
                    <Input
                      placeholder='선택 입력'
                      autoComplete='off'
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='address'
              render={({ field }) => (
                <FormItem className='grid gap-2 space-y-0'>
                  <FormLabel>주소</FormLabel>
                  <FormControl>
                    <Input
                      placeholder='선택 입력'
                      autoComplete='off'
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='email'
              render={({ field }) => (
                <FormItem className='grid gap-2 space-y-0'>
                  <FormLabel>이메일</FormLabel>
                  <CustomerEmailInput
                    value={field.value}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                    name={field.name}
                    inputRef={field.ref}
                  />
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='memo'
              render={({ field }) => (
                <FormItem className='grid gap-2 space-y-0'>
                  <FormLabel>메모</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder='선택 입력'
                      className='min-h-[100px]'
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </form>
        </Form>

        <DialogFooter>
          <Button
            type='button'
            variant='outline'
            onClick={() => onOpenChange(false)}
            disabled={isSaving}
          >
            취소
          </Button>
          <Button type='submit' form='customer-edit-form' disabled={isSaving}>
            {isSaving ? '저장 중...' : '저장'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
