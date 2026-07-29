"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export function LeaveWorkspace() {
    const [open, setOpen] = useState(false);

    return (
        <div className="flex items-center justify-between rounded-lg border p-5">
            <div>
                <h3 className="font-semibold">
                    Leave Workspace
                </h3>

                <p className="text-sm text-muted-foreground">
                    Leave this workspace. You can be invited again later.
                </p>
            </div>

            <AlertDialog
                open={open}
                onOpenChange={setOpen}
            >
                <AlertDialogTrigger asChild>
                    <Button variant="outline">
                        Leave Workspace
                    </Button>
                </AlertDialogTrigger>

                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>
                            Leave Workspace?
                        </AlertDialogTitle>

                        <AlertDialogDescription>
                            This feature is not implemented yet.
                        </AlertDialogDescription>
                    </AlertDialogHeader>

                    <AlertDialogFooter>
                        <AlertDialogCancel>
                            Cancel
                        </AlertDialogCancel>

                        <AlertDialogAction>
                            Continue
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}