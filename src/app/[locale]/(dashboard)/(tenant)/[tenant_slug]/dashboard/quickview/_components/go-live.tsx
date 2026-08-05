'use client'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { ExternalLink } from 'lucide-react'
import { useTranslations } from 'next-intl'

export default function GoLive() {
    const params = useParams()
    const tenant = params.tenant_slug
    const t = useTranslations('dashboard.quickview')
    const destinationUrl = `https://${tenant}.graphood.com`

    return (
        <div className="w-full py-2 px-5 bg-amber-200/50">
            <div className="flex flex-row items-center justify-between gap-4">
                <div>
                    <h3 className="text font-semibold tracking-tight text-foreground">
                        {t('launch.title')}
                    </h3>
                </div>

                <Link href={tenant ? destinationUrl : '/not-found'} target="_blank" rel="noopener noreferrer">
                    <Button className="w-full md:w-auto gap-2" size="lg">
                        {t('launch.action')}
                        <ExternalLink className="h-4 w-4" />
                    </Button>
                </Link>
            </div>
        </div>
    )
}
