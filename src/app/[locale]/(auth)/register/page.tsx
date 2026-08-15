import RegisterForm from "./_components/RegisterForm";
import RegisterHero from "./_components/RegisterHero";

export default function page() {
    return (
        <main
            dir="ltr"
            className="grid min-h-svh w-full grid-cols-1 lg:grid-cols-2"
        >
            <RegisterForm />
            <RegisterHero />
        </main>
    );
}
