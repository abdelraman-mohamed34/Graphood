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

export function DeleteWorkspace() {
    const [open, setOpen] = useState(false);

    return (
        <div className="flex items-center justify-between rounded-lg border border-destructive/30 p-5">
            <div>
                <h3 className="font-semibold text-destructive">
                    Delete Workspace
                </h3>

                <p className="text-sm text-muted-foreground">
                    Permanently delete this workspace and all of its data. This action cannot be undone.
                </p>
            </div>

            <AlertDialog
                open={open}
                onOpenChange={setOpen}
            >
                <AlertDialogTrigger asChild>
                    <Button variant="destructive">
                        Delete Workspace
                    </Button>
                </AlertDialogTrigger>

                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>
                            Delete Workspace?
                        </AlertDialogTitle>

                        <AlertDialogDescription>
                            Workspace deletion is not implemented yet.
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