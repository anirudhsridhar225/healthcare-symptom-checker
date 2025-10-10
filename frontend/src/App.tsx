import { Button } from "@/components/ui/button"
import {
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { zodResolver } from '@hookform/resolvers/zod'
import { FormProvider, useForm } from 'react-hook-form'
import { z } from 'zod'
import { endpoint } from '../endpoint'
import './App.css'

import { QueryClient, QueryClientProvider, useMutation, useQueryClient } from '@tanstack/react-query'

const queryClient = new QueryClient()

const formSchema = z.object({
    name: z.string().min(2).max(30),
    symptoms: z.string().min(10).max(200),
})

const getDiagnosis = async (data: z.infer<typeof formSchema>) => {
    const response = await fetch(`${endpoint}/diagnose`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ "name": data.name, "symptoms": data.symptoms }),
    })

    return await response.json()
}

function App() {
    return (
        <QueryClientProvider client={queryClient}>
            <FormComponent />
        </QueryClientProvider>
    )
}

function FormComponent() {
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: 'John',
            symptoms: 'Fever and cough',
        }
    })

    const qc = useQueryClient()

    const mutation = useMutation({
        mutationFn: getDiagnosis,
        onSuccess: () => qc.invalidateQueries({ queryKey : ['symptoms'] }),
        onError: (err: unknown) => console.error(err)
    })

    const onSubmit = (values: z.infer<typeof formSchema>) => {
        mutation.mutate(values)
    }

    return (
        <FormProvider {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <FormField
                    control={form.control}
                    name="name"
                    render={({ field }: any) => (
                        <FormItem>
                            <FormLabel>Name</FormLabel>
                            <FormControl>
                                <Input placeholder="John" {...field} />
                            </FormControl>
                            <FormDescription>
                                This is your public display name.
                            </FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="symptoms"
                    render={({ field }: any) => (
                        <FormItem>
                            <FormLabel>Symptoms</FormLabel>
                            <FormControl>
                                <Input placeholder="Fever and cough" {...field} />
                            </FormControl>
                            <FormDescription>
                                Describe your symptoms in detail.
                            </FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <Button type="submit">Submit</Button>

                {mutation.isError && <p>Error: {(mutation.error as Error).message}<br /> caused by {String((mutation.error as Error).cause) || "cause"}<br /> with the stack trace {(mutation.error as Error).stack}</p>}
                {mutation.isSuccess && <p className="bg-blue-400 text-black p-10 border border-black">Success: <br />{mutation.data.response}</p>}
            </form>
        </FormProvider>
    )
}

export default App
