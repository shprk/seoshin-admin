import { useState } from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { ageGroups } from '@/lib/age-groups'
import { createCustomer } from '@/lib/api/customers'
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
import { Textarea } from '@/components/ui/textarea'
import { SelectDropdown } from '@/components/select-dropdown'
import { type Customer } from '../data/schema'
import { CustomerAddressInput } from './customer-address-input'
import { CustomerEmailInput } from './customer-email-input'

const emptyValues = {
  participantNo: '',
  name: '',
  ageGroup: undefined,
  matchedParticipantNo: '',
  address: '',
  email: '',
  memo: '',
}

const formSchema = z.object({
  participantNo: z.string().trim().min(1, '참가번호를 입력해주세요.'),
  name: z.string().trim().min(1, '이름을 입력해주세요.'),
  ageGroup: z.enum(ageGroups, { error: '연령을 선택해주세요.' }),
  matchedParticipantNo: z.string(),
  address: z.string(),
  email: optionalEmailSchema,
  memo: z.string(),
})

type CustomerCreateForm = z.infer<typeof formSchema>

type CustomerCreateDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCreated: (customer: Customer) => void
}

export function CustomerCreateDialog({
  open,
  onOpenChange,
  onCreated,
}: CustomerCreateDialogProps) {
  const [isSaving, setIsSaving] = useState(false)
  const form = useForm<CustomerCreateForm>({
    resolver: zodResolver(formSchema),
    defaultValues: emptyValues,
  })

  const close = () => {
    form.reset(emptyValues)
    onOpenChange(false)
  }

  const onSubmit = async (values: CustomerCreateForm) => {
    setIsSaving(true)
    try {
      const created = await createCustomer({
        participantNo: values.participantNo,
        name: values.name,
        ageGroup: values.ageGroup,
        matchedParticipantNo: values.matchedParticipantNo.trim() || null,
        address: values.address.trim(),
        email: values.email.trim(),
        memo: values.memo.trim(),
      })
      onCreated(created)
      close()
      toast.success('고객을 등록했습니다.')
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : '고객을 등록하지 못했습니다.'
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
        if (state) {
          onOpenChange(true)
          return
        }
        close()
      }}
    >
      <DialogContent className='max-h-[90vh] overflow-y-auto sm:max-w-lg'>
        <DialogHeader className='text-start'>
          <DialogTitle>고객 등록</DialogTitle>
          <DialogDescription>
            참가번호를 직접 입력해 고객을 등록합니다.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            id='customer-create-form'
            onSubmit={form.handleSubmit(onSubmit)}
            className='space-y-4 px-0.5'
          >
            <FormField
              control={form.control}
              name='participantNo'
              render={({ field }) => (
                <FormItem className='grid gap-2 space-y-0'>
                  <FormLabel>참가번호</FormLabel>
                  <FormControl>
                    <Input autoComplete='off' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
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
                    defaultValue={field.value ?? ''}
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
                  <CustomerAddressInput
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
            onClick={close}
            disabled={isSaving}
          >
            취소
          </Button>
          <Button type='submit' form='customer-create-form' disabled={isSaving}>
            {isSaving ? '등록 중...' : '등록'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
