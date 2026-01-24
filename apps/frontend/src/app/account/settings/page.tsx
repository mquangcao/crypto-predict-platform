"use client";

import { LogoutButton } from "@/components/buttons";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Topbar } from "@/components/layout/Topbar";
import { AuthGuard } from "@/guards/auth-guard";
import { AccountSettingsForm } from "./account-settings-form";
import { ChangePasswordForm } from "./change-password-form";
import { User } from "lucide-react";

export default function AccountSettingsPage() {
  return (
    <AuthGuard>
      <div className="min-h-screen bg-slate-50">
        <main className="flex flex-col">
          <Topbar />

          <div className="flex-1 flex flex-col items-center p-6 md:p-12 overflow-y-auto">
            <div className="w-full max-w-4xl space-y-10">
              {/* Header section matching the image */}
              <div className="flex items-start gap-4">
                <div className="mt-1">
                  <User
                    size={36}
                    className="text-slate-900"
                    strokeWidth={1.5}
                  />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-slate-900">
                    Profile Settings
                  </h1>
                  <p className="text-sm text-slate-500 font-medium">
                    Manage your account information and security
                  </p>
                </div>
              </div>

              <div className="grid gap-6">
                {/* Basic Information Card */}
                <Card className="border border-slate-200 shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-lg font-bold">
                      Basic information
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <AccountSettingsForm />
                  </CardContent>
                </Card>

                {/* Change Password Card */}
                <Card className="border border-slate-200 shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-lg font-bold">
                      Change password
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ChangePasswordForm />
                  </CardContent>
                </Card>

                <div className="flex justify-center pt-4">
                  <LogoutButton />
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </AuthGuard>
  );
}
