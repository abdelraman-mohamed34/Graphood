"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import {
    RegisterInputType,
    RegisterInputsSchema,
} from "@/shared/lib/schemas";


import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import GoogleBtn from "../../login/_components/GoogleBtn";
import Or from "../../login/_components/Or";
import { useRegister } from "@/shared/lib/supabase";

function RegisterForm() {
    const { signUpWithPassword, isLoading } = useRegister();

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<RegisterInputType>({
        resolver: zodResolver(RegisterInputsSchema),
    });

    const onSubmit = (data: RegisterInputType) => {
        signUpWithPassword(data);
    };

    return (
        <div className="w-full p-35">
            <div className="mb-6">
                <h1 className="text-2xl font-bold">
                    Create a Graphood account
                </h1>

                <h2>
                    Explore Graphood for free. No credit card required.
                </h2>
            </div>

            <form
                onSubmit={handleSubmit(onSubmit)}
                className="flex flex-col gap-4"
            >
                <div className="flex flex-col gap-2">
                    <Label>First Name</Label>

                    <Input
                        {...register("first_name")}
                        placeholder="Enter your first name"
                        className="border rounded-md p-2"
                    />

                    {errors.first_name && (
                        <p className="text-sm text-red-500">
                            {errors.first_name.message}
                        </p>
                    )}
                </div>

                <div className="flex flex-col gap-2">
                    <Label>Last Name</Label>

                    <Input
                        {...register("last_name")}
                        placeholder="Enter your last name"
                        className="border rounded-md p-2"
                    />

                    {errors.last_name && (
                        <p className="text-sm text-red-500">
                            {errors.last_name.message}
                        </p>
                    )}
                </div>

                <div className="flex flex-col gap-2">
                    <Label>Email</Label>

                    <Input
                        type="email"
                        {...register("email")}
                        placeholder="Enter your email"
                        className="border rounded-md p-2"
                    />

                    {errors.email && (
                        <p className="text-sm text-red-500">
                            {errors.email.message}
                        </p>
                    )}
                </div>

                <div className="flex flex-col gap-2">
                    <Label>Password</Label>

                    <Input
                        type="password"
                        {...register("password")}
                        placeholder="Enter your password"
                        className="border rounded-md p-2"
                    />

                    {errors.password && (
                        <p className="text-sm text-red-500">
                            {errors.password.message}
                        </p>
                    )}
                </div>

                <Button
                    type="submit"
                    disabled={isLoading}
                    className="rounded-md py-5 bg-primary-foreground font-medium"
                >
                    {isLoading
                        ? "Creating account..."
                        : "Create Graphood account"}
                </Button>
            </form>

            <Or />
            <GoogleBtn />
        </div>
    );
}

export default RegisterForm;