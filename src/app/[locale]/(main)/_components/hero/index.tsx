import GraphoodCube from './Cube'
import CTA from './CTA'

function Hero() {
    return (
        <section className="relative grid grid-cols-1 md:grid-cols-2 items-center min-h-[600px] px-8 md:px-20 bg-black overflow-hidden">

            {/* الخلفية المتوهجة (Glow Effect) */}
            <div className="absolute top-1/2 left-3/4 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-500/20 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute top-1/3 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-purple-500/10 rounded-full blur-[100px] pointer-events-none" />

            {/* طبقة الـ Noise */}
            <div className="absolute inset-0 opacity-[0.04] pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />

            <div className="relative w-full space-y-6 z-10">
                <h1 className="text-5xl md:text-7xl font-black tracking-tighter leading-[0.9] text-white">
                    Secure your <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
                        crypto.
                    </span> Anytime,<br />
                    Anywhere
                </h1>
                <p className="text-slate-400 text-lg max-w-md leading-relaxed">
                    From wireframes to polished interfaces — get instant feedback,
                    fresh ideas, and clean code.
                </p>
                <CTA />
            </div>

            <div className="relative w-full h-[500px] flex items-center justify-center z-10">
                <GraphoodCube />
            </div>
        </section>
    )
}

export default Hero