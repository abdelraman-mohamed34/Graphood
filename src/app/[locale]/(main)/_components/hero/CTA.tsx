import { Button } from '@/components/ui/button'
import { Link } from '@/i18n/navigation';
import { MoveUpRight } from "lucide-react";

function CTA() {
    return (
        <div className="flex gap-4 pt-4">
            <Link href='/login'>
                <Button className="px-8 py-3 font-bold transition text-primary bg-background  hover:bg-background/90">
                    Get started
                    <MoveUpRight />
                </Button>
            </Link>
        </div>
    )
}

export default CTA