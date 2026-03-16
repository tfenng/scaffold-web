"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getApiError, getApiErrorMessage, userApi } from "@/lib/api";
import { createUserSchema, updateUserSchema, type CreateUserInput, type UpdateUserInput } from "@/schemas/user-schema";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface UserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: number | null;
}

type UserFormValues = {
  uid?: string;
  email?: string;
  name: string;
  used_name?: string;
  company?: string;
  birth?: string;
};

const formFieldNames = ["uid", "email", "name", "used_name", "company", "birth"] as const;

const toOptionalString = (value?: string) => {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
};

const normalizeCreateInput = (data: CreateUserInput) => ({
  uid: data.uid.trim(),
  name: data.name.trim(),
  email: toOptionalString(data.email),
  used_name: toOptionalString(data.used_name),
  company: toOptionalString(data.company),
  birth: toOptionalString(data.birth),
});

const normalizeUpdateInput = (data: UpdateUserInput) => ({
  email: toOptionalString(data.email),
  name: data.name.trim(),
  used_name: toOptionalString(data.used_name),
  company: toOptionalString(data.company),
  birth: toOptionalString(data.birth),
});

export function UserDialog({ open, onOpenChange, userId }: UserDialogProps) {
  const queryClient = useQueryClient();
  const isEdit = userId !== null;

  const {
    data: user,
    error: userError,
    isError: isUserError,
    isLoading: isUserLoading,
  } = useQuery({
    queryKey: ["user", userId],
    queryFn: () => userApi.getById(userId!),
    enabled: isEdit && open,
  });

  const {
    register,
    handleSubmit,
    reset,
    setError,
    clearErrors,
    formState: { errors },
  } = useForm<UserFormValues>({
    resolver: zodResolver(isEdit ? updateUserSchema : createUserSchema),
  });

  const userData = user?.data.data;
  const userLoadErrorMessage = getApiErrorMessage(userError, "Failed to load user");

  useEffect(() => {
    if (userData && isEdit) {
      reset({
        email: userData.email ?? "",
        name: userData.name,
        used_name: userData.used_name,
        company: userData.company,
        birth: userData.birth ?? "",
      });
    } else if (!isEdit) {
      reset({
        uid: "",
        email: "",
        name: "",
        used_name: "",
        company: "",
        birth: "2000-01-01",
      });
    }
  }, [userData, isEdit, reset, open]);

  const applyServerFieldErrors = (error: unknown) => {
    const apiError = getApiError(error);
    const fieldErrors = apiError?.fields;
    if (!fieldErrors) {
      return false;
    }

    let hasKnownFieldError = false;
    for (const fieldName of formFieldNames) {
      const message = fieldErrors[fieldName];
      if (!message) {
        continue;
      }

      hasKnownFieldError = true;
      setError(fieldName, { type: "server", message });
    }

    return hasKnownFieldError;
  };

  const createMutation = useMutation({
    mutationFn: (data: CreateUserInput) => userApi.create(normalizeCreateInput(data)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      clearErrors();
      toast.success("User created successfully");
      onOpenChange(false);
    },
    onError: (mutationError) => {
      if (applyServerFieldErrors(mutationError)) {
        return;
      }

      toast.error(getApiErrorMessage(mutationError, "Failed to create user"));
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: UpdateUserInput) => userApi.update(userId!, normalizeUpdateInput(data)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      queryClient.invalidateQueries({ queryKey: ["user", userId] });
      clearErrors();
      toast.success("User updated successfully");
      onOpenChange(false);
    },
    onError: (mutationError) => {
      if (applyServerFieldErrors(mutationError)) {
        return;
      }

      toast.error(getApiErrorMessage(mutationError, "Failed to update user"));
    },
  });

  const onSubmit = (data: UserFormValues) => {
    clearErrors();

    if (isEdit) {
      updateMutation.mutate(data as UpdateUserInput);
    } else {
      createMutation.mutate(data as CreateUserInput);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit User" : "Create User"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          {isEdit && isUserLoading ? (
            <div className="flex justify-center py-10">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : isEdit && isUserError ? (
            <div className="py-4">
              <p className="text-sm text-destructive">{userLoadErrorMessage}</p>
            </div>
          ) : (
            <div className="grid gap-4 py-4">
              {isEdit && (
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label className="text-right">UID</Label>
                  <span className="col-span-3 text-muted-foreground">{userData?.uid || "-"}</span>
                </div>
              )}
              {!isEdit && (
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="uid" className="text-right">
                    UID
                  </Label>
                  <Input
                    id="uid"
                    {...register("uid")}
                    className="col-span-3"
                    placeholder="Required"
                  />
                  {errors.uid && (
                    <p className="col-span-4 text-right text-sm text-destructive">
                      {errors.uid.message as string}
                    </p>
                  )}
                </div>
              )}
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  Name
                </Label>
                <Input
                  id="name"
                  {...register("name")}
                  className="col-span-3"
                  placeholder="John Doe"
                />
                {errors.name && (
                  <p className="col-span-4 text-right text-sm text-destructive">
                    {errors.name.message as string}
                  </p>
                )}
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="used_name" className="text-right">
                  Used Name
                </Label>
                <Input
                  id="used_name"
                  {...register("used_name")}
                  className="col-span-3"
                  placeholder="Optional"
                />
                {errors.used_name && (
                  <p className="col-span-4 text-right text-sm text-destructive">
                    {errors.used_name.message as string}
                  </p>
                )}
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="company" className="text-right">
                  Company
                </Label>
                <Input
                  id="company"
                  {...register("company")}
                  className="col-span-3"
                  placeholder="Optional"
                />
                {errors.company && (
                  <p className="col-span-4 text-right text-sm text-destructive">
                    {errors.company.message as string}
                  </p>
                )}
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="birth" className="text-right">
                  Birth
                </Label>
                <Input
                  id="birth"
                  type="date"
                  {...register("birth")}
                  className="col-span-3"
                  placeholder="YYYY-MM-DD"
                />
                {errors.birth && (
                  <p className="col-span-4 text-right text-sm text-destructive">
                    {errors.birth.message as string}
                  </p>
                )}
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="email" className="text-right">
                  Email
                </Label>
                <Input
                  id="email"
                  {...register("email")}
                  className="col-span-3"
                  placeholder="user@example.com"
                />
                {errors.email && (
                  <p className="col-span-4 text-right text-sm text-destructive">
                    {errors.email.message as string}
                  </p>
                )}
              </div>
            </div>
          )}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={
                createMutation.isPending ||
                updateMutation.isPending ||
                (isEdit && (isUserLoading || isUserError))
              }
            >
              {createMutation.isPending || updateMutation.isPending ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
