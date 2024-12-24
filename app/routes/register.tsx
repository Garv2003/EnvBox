import React from "react";
import { Label, Input } from "@/components";
import { cn } from "@/lib/utils";
import { Link, Form } from "react-router";
import { useToast } from "@/hooks/use-toast"
import { useForm } from "react-hook-form";
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod";
import type { Route } from "./+types/register";

export function meta({ }: Route.MetaArgs) {
    return [
        { title: "EnvBox Register" },
        { name: "description", content: "Register to EnvBox" },
    ];
}

const RegisterSchema = z.object({
    firstname: z.string().min(2, "characters must be at least 2 characters").max(30, "characters must be at most 30 characters"),
    lastname: z.string().min(2, "characters must be at least 2 characters").max(30, "characters must be at most 30 characters"),
    email: z.string().email("Please enter a valid email address"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string().min(8, "Password must be at least 8 characters"),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
});

type FormData = z.infer<typeof RegisterSchema>;

export default function Register() {
    const { toast } = useToast();
    const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
        resolver: zodResolver(RegisterSchema),
    });
    const onSubmit = async (data: FormData) => {
        console.log("SUCCESS", data);
        toast({
            title: "Login successful",
            description: "You have successfully logged in",
        });
    }

    return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="max-w-md w-full mx-auto rounded-none md:rounded-2xl p-4 md:p-8 shadow-input bg-transparent">
                <h2 className="font-bold text-xl text-neutral-200">
                    Register to EnvBox
                </h2>
                <p className="mt-2 leading-5 text-zinc-400">
                    To start using EnvBox, please register an account.
                </p>
                <Form className="my-8" onSubmit={handleSubmit(onSubmit)}>
                    <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-2 mb-4">
                        <LabelInputContainer>
                            <Label htmlFor="firstname">First name</Label>
                            <Input id="firstname" placeholder="Tyler" type="text" {...register("firstname")} className="text-zinc-200" />
                            {errors.firstname && <span className="text-red-500">{errors.firstname.message}</span>}
                        </LabelInputContainer>
                        <LabelInputContainer>
                            <Label htmlFor="lastname">Last name</Label>
                            <Input id="lastname" placeholder="Durden" type="text" {...register("lastname")} className="text-zinc-200" />
                            {errors.lastname && <span className="text-red-500">{errors.lastname.message}</span>}
                        </LabelInputContainer>
                    </div>
                    <LabelInputContainer className="mb-4">
                        <Label htmlFor="email">Email Address</Label>
                        <Input id="email" placeholder="projectmayhem@fc.com" type="email" {...register("email")} className="text-zinc-200" />
                        {errors.email && <span className="text-red-500">{errors.email.message}</span>}
                    </LabelInputContainer>
                    <LabelInputContainer className="mb-4">
                        <Label htmlFor="password">Password</Label>
                        <Input id="password" placeholder="••••••••" type="password" {...register("password")} className="text-zinc-200" />
                        {errors.password && <span className="text-red-500">{errors.password.message}</span>}
                    </LabelInputContainer>
                    <LabelInputContainer className="mb-8">
                        <Label htmlFor="twitterpassword">Confirm Password</Label>
                        <Input
                            id="confirmPassword"
                            placeholder="••••••••"
                            type="password"
                            {...register("confirmPassword")}
                            className="text-zinc-200"
                        />
                        {errors.confirmPassword && <span className="text-red-500">{errors.confirmPassword.message}</span>}
                    </LabelInputContainer>

                    <button
                        className="bg-gradient-to-br relative group/btn from-zinc-900 to-zinc-900 block dark:bg-zinc-800 w-full text-white rounded-md h-10 font-medium shadow-[0px_1px_0px_0px_var(--zinc-800)_inset,0px_-1px_0px_0px_var(--zinc-800)_inset]"
                        type="submit"
                    >
                        Register
                        <BottomGradient />
                    </button>

                    <div className="flex items-center justify-center gap-4 text-sm text-zinc-400 mt-4">
                        Already have an account?{" "}
                        <Link to="/login" className="text-cyan-500">
                            Login
                        </Link>
                    </div>
                    <div className="bg-gradient-to-r from-transparent via-neutral-700 to-transparent mt-8 h-[1px] w-full" />
                </Form>
            </div>
        </div>
    );
}

const BottomGradient = () => {
    return (
        <>
            <span className="group-hover/btn:opacity-100 block transition duration-500 opacity-0 absolute h-px w-full -bottom-px inset-x-0 bg-gradient-to-r from-transparent via-cyan-500 to-transparent" />
            <span className="group-hover/btn:opacity-100 blur-sm block transition duration-500 opacity-0 absolute h-px w-1/2 mx-auto -bottom-px inset-x-10 bg-gradient-to-r from-transparent via-indigo-500 to-transparent" />
        </>
    );
};

const LabelInputContainer = ({
    children,
    className,
}: {
    children: React.ReactNode;
    className?: string;
}) => {
    return (
        <div className={cn("flex flex-col space-y-2 w-full", className)}>
            {children}
        </div>
    );
};
