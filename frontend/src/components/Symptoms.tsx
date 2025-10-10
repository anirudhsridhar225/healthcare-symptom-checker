import { zodResolver } from "@hookform/resolvers/zod"
import { Form, useForm } from "react-hook-form"
import { z } from "zod"
import { endpoint } from "../../endpoint"
import { Button } from "./ui/button"
import {
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage
} from "./ui/form"
import { Input } from "./ui/input"

const formSchema = z.object({
    name: z.string().min(2).max(100),
    symptoms: z.string().min(10).max(500),
})

export default function Symptoms() {
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: 'John',
            symptoms: 'Fever and cough',
        }
    })

    const onSubmit = (values : z.infer<typeof formSchema>) => {
        console.log(values)
        console.log(endpoint + "dabby")
    }


    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
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
                    render={({ field }) => (
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
            </form>
        </Form>
    )
}