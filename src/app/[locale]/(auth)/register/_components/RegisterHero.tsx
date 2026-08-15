import Image from 'next/image'

function RegisterHero() {
    return (
        <div className="relative hidden h-full w-full p-2 lg:block">
            <div className="relative w-full h-full rounded overflow-hidden bg-gray-400">
                <Image
                    src="https://images.unsplash.com/photo-1782235796440-16b1d5682d5f?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                    alt="Description"
                    fill
                    sizes="(max-width: 768px) 0vw, 50vw"
                    className="object-cover"
                />
            </div>
        </div>
    )
}

export default RegisterHero
