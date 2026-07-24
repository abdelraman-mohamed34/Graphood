"use client";

import React, { useState } from "react";
import { useDeveloperApiKeys } from "@/features/developer/api-keys/hooks/use-developer-api-keys";
import { Loader2, Plus, Key, Trash2, Edit3, ArrowLeft, RefreshCw, Copy, Check } from "lucide-react";
import { useSystem } from "@/shared/lib/hooks";

export default function Developer() {
    const { systems, isLoading: isLoadingSystems, createSystem, deleteSystem, isCreating, isDeleting } = useSystem();

    const [selectedSystemId, setSelectedSystemId] = useState<string | null>(null);

    const [newSystemName, setNewSystemName] = useState("");
    const [newSystemDesc, setNewSystemDesc] = useState("");
    const [isAddingSystem, setIsAddingSystem] = useState(false);

    const [copiedKeyId, setCopiedKeyId] = useState<string | null>(null);

    const {
        apiKeys,
        isLoading: isLoadingKeys,
        createApiKey,
        deleteApiKey,
        regenerateApiKey,
        isCreating: isCreatingKey,
    } = useDeveloperApiKeys({ systemId: selectedSystemId || "" });

    const handleCreateSystem = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newSystemName.trim()) return;

        try {
            await createSystem({
                name: newSystemName,
                description: newSystemDesc,
            });
            setNewSystemName("");
            setNewSystemDesc("");
            setIsAddingSystem(false);
        } catch (err) {
            console.error(err);
        }
    };

    const handleCopy = (key: string, id: string) => {
        navigator.clipboard.writeText(key);
        setCopiedKeyId(id);
        setTimeout(() => setCopiedKeyId(null), 2000);
    };

    const selectedSystem = systems.find((s) => s.id === selectedSystemId);

    if (isLoadingSystems) {
        return (
            <div className="flex justify-center items-center h-48">
                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* إذا كان المستخدم فاتح نظام معين لإدارة الـ API Keys */}
            {selectedSystemId && selectedSystem ? (
                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <button
                            onClick={() => setSelectedSystemId(null)}
                            className="flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors"
                        >
                            <ArrowLeft className="w-4 h-4 mr-2" /> العودة لقائمة الأنظمة
                        </button>
                        <button
                            onClick={() => createApiKey({ system_id: selectedSystemId, name: "Default Key" })}
                            disabled={isCreatingKey}
                            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90 disabled:opacity-50"
                        >
                            {isCreatingKey ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                            توليد API Key جديد
                        </button>
                    </div>

                    <div>
                        <h2 className="text-xl font-bold">{selectedSystem.name}</h2>
                        <p className="text-sm text-muted-foreground">{selectedSystem.description || "لا يوجد وصف للنظام."}</p>
                    </div>

                    <div className="border border-border/60 rounded-lg divide-y divide-border/60">
                        {isLoadingKeys ? (
                            <div className="p-8 text-center text-sm text-muted-foreground">جاري تحميل المفاتيح...</div>
                        ) : apiKeys.length === 0 ? (
                            <div className="p-8 text-center text-sm text-muted-foreground">لا يوجد API Keys معرّفة لهذا النظام حتى الآن.</div>
                        ) : (
                            apiKeys.map((key) => (
                                <div key={key.id} className="p-4 flex items-center justify-between gap-4">
                                    <div className="space-y-1">
                                        <p className="text-sm font-medium">{key.name || "API Key"}</p>
                                        <code className="text-xs bg-muted px-2 py-1 rounded font-mono">
                                            {key.key || "••••••••••••••••••••••••••••••••"}
                                        </code>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {key.key && (
                                            <button
                                                onClick={() => handleCopy(key.key, key.id)}
                                                className="p-2 text-muted-foreground hover:text-foreground border rounded-md"
                                                title="نسخ"
                                            >
                                                {copiedKeyId === key.id ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                                            </button>
                                        )}
                                        <button
                                            onClick={() => regenerateApiKey(key.id)}
                                            className="p-2 text-muted-foreground hover:text-foreground border rounded-md"
                                            title="إعادة توليد"
                                        >
                                            <RefreshCw className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => deleteApiKey(key.id)}
                                            className="p-2 text-red-500 hover:bg-red-500/10 border rounded-md"
                                            title="حذف"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            ) : (
                /* عرض قائمة الأنظمة (Systems List) */
                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-lg font-semibold">إدارة الأنظمة (Developer Systems)</h2>
                            <p className="text-sm text-muted-foreground">أنشئ الأنظمة الخاصة بك لإدارة صلاحيات الوصول والـ API Keys.</p>
                        </div>
                        <button
                            onClick={() => setIsAddingSystem(true)}
                            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90"
                        >
                            <Plus className="w-4 h-4" /> نظام جديد
                        </button>
                    </div>

                    {/* Form إضافة نظام جديد */}
                    {isAddingSystem && (
                        <form onSubmit={handleCreateSystem} className="p-4 border rounded-lg bg-card space-y-4">
                            <h3 className="font-medium text-sm">إضافة نظام جديد</h3>
                            <div className="space-y-2">
                                <input
                                    type="text"
                                    placeholder="اسم النظام (مثال: E-Commerce Store)"
                                    value={newSystemName}
                                    onChange={(e) => setNewSystemName(e.target.value)}
                                    className="w-full px-3 py-2 text-sm border rounded-md bg-background focus:outline-none focus:ring-1 focus:ring-primary"
                                    required
                                />
                                <textarea
                                    placeholder="وصف مختصر للنظام (اختياري)"
                                    value={newSystemDesc}
                                    onChange={(e) => setNewSystemDesc(e.target.value)}
                                    className="w-full px-3 py-2 text-sm border rounded-md bg-background focus:outline-none focus:ring-1 focus:ring-primary resize-none h-20"
                                />
                            </div>
                            <div className="flex justify-end gap-2">
                                <button
                                    type="button"
                                    onClick={() => setIsAddingSystem(false)}
                                    className="px-3 py-1.5 text-xs border rounded-md hover:bg-muted"
                                >
                                    إلغاء
                                </button>
                                <button
                                    type="submit"
                                    disabled={isCreating}
                                    className="px-3 py-1.5 text-xs bg-primary text-primary-foreground rounded-md flex items-center gap-1"
                                >
                                    {isCreating && <Loader2 className="w-3 h-3 animate-spin" />} حفظ النظام
                                </button>
                            </div>
                        </form>
                    )}

                    {/* Grid الأنظمة */}
                    {systems.length === 0 ? (
                        <div className="border border-dashed p-8 text-center rounded-lg space-y-3">
                            <Key className="w-8 h-8 text-muted-foreground mx-auto" />
                            <p className="text-sm text-muted-foreground">لا يوجد لديك أي أنظمة معرّفة حالياً.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {systems.map((system) => (
                                <div key={system.id} className="border rounded-lg p-5 space-y-4 bg-card flex flex-col justify-between">
                                    <div className="space-y-1">
                                        <h3 className="font-medium">{system.name}</h3>
                                        <p className="text-xs text-muted-foreground line-clamp-2">{system.description || "بدون وصف"}</p>
                                    </div>
                                    <div className="pt-3 border-t flex items-center justify-between">
                                        <button
                                            onClick={() => setSelectedSystemId(system.id)}
                                            className="text-xs font-medium text-primary hover:underline flex items-center gap-1"
                                        >
                                            <Key className="w-3.5 h-3.5" /> إدارة الـ API Keys
                                        </button>
                                        <button
                                            onClick={() => deleteSystem(system.id)}
                                            disabled={isDeleting}
                                            className="p-1.5 text-red-500 hover:bg-red-500/10 rounded-md"
                                            title="حذف النظام"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}