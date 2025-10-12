import React from 'react'
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
import { useAuth } from '@/contexts/AuthContext'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { trpcClient } from '@/lib/trpc-client'
import { authClient } from '@/lib/auth-client'

const formSchema = z.object({
    symptoms: z.string().min(10).max(1000),
})

const getDiagnosis = async (data: z.infer<typeof formSchema>) => {
    const response = await authClient.$fetch('http://localhost:4000/api/trpc/llm.diagnose', {
        method: 'POST',
        headers: {
            'content-type': 'application/json',
        },
        body: JSON.stringify({
            symptoms: data.symptoms
        })
    })

    return response
}

export const DiagnoseForm: React.FC = () => {
    const { user } = useAuth()
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            symptoms: '',
        }
    })

    const qc = useQueryClient()

    const mutation = useMutation({
        mutationFn: getDiagnosis,
        onSuccess: () => qc.invalidateQueries({ queryKey: ['symptoms'] }),
        onError: (err: unknown) => console.error(err)
    })

    const onSubmit = (values: z.infer<typeof formSchema>) => {
        mutation.mutate(values)
    }

    return (
        <div className="max-w-2xl mx-auto">
            <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    Health Diagnosis
                </h2>
                <p className="text-gray-600">
                    Describe your symptoms and get an AI-powered diagnosis.
                </p>
            </div>

            <FormProvider {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <FormField
                        control={form.control}
                        name="symptoms"
                        render={({ field }: any) => (
                            <FormItem>
                                <FormLabel>Symptoms</FormLabel>
                                <FormControl>
                                    <Input 
                                        placeholder="Describe your symptoms in detail..." 
                                        {...field} 
                                    />
                                </FormControl>
                                <FormDescription>
                                    Describe your symptoms in detail for better diagnosis.
                                </FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <Button 
                        type="submit" 
                        disabled={mutation.isPending}
                        className="w-full"
                    >
                        {mutation.isPending ? 'Analyzing...' : 'Get Diagnosis'}
                    </Button>

                    {mutation.isError && (
                        <div className="bg-red-50 border border-red-200 rounded-md p-4">
                            <p className="text-red-800">
                                Error: {(mutation.error as Error).message}
                            </p>
                        </div>
                    )}
                    
                    {mutation.isSuccess && (
                        <div className="bg-blue-50 border border-blue-200 rounded-md p-6">
                            <h3 className="text-lg font-semibold text-blue-900 mb-2">
                                Diagnosis Result
                            </h3>
                            <p className="text-blue-800 whitespace-pre-wrap">
                                {mutation.data.response.text() || ""}
                            </p>
                        </div>
                    )}
                </form>
            </FormProvider>
        </div>
    )
}
