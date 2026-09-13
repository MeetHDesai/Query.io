"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm, Controller } from "react-hook-form";

interface ConnectionFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: ConnectionData) => void;
}

export interface ConnectionData {
  name: string;
  type: string;
  host: string;
  port: string;
  database: string;
  username: string;
  password: string;
}

export function ConnectionForm({ open, onClose, onSubmit }: ConnectionFormProps) {
  const { register, control, handleSubmit, formState: { errors } } = useForm<ConnectionData>({
    defaultValues: {
      name: "",
      type: "postgres",
      host: "localhost",
      port: "5432",
      database: "",
      username: "",
      password: ""
    }
  });

  const onFormSubmit = (data: ConnectionData) => {
    onSubmit(data);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <form onSubmit={handleSubmit(onFormSubmit)}>
          <DialogHeader>
            <DialogTitle>Add New Database Connection</DialogTitle>
            <DialogDescription>
              Enter your database details to connect to your database.
            </DialogDescription>
          </DialogHeader>
          <div>
            <div>
              <Label htmlFor="name">
                Name
              </Label>
              <Input
                id="name"
                placeholder="My Database"
                className="w-full"
                {...register("name", { required: "Name is required" })}
              />
              {errors.name && <p>{errors.name.message}</p>}
            </div>
            
            <div>
              <Label htmlFor="type">
                Type
              </Label>
              <Controller
                control={control}
                name="type"
                render={({ field }) => (
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="PostgreSQL" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="POSTGRESQL">PostgreSQL</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
            
            <div>
              <Label htmlFor="host">
                Host
              </Label>
              <Input
                id="host"
                placeholder="localhost"
                className="w-full"
                {...register("host", { required: "Host is required" })}
              />
              {errors.host && <p>{errors.host.message}</p>}
            </div>
            
            <div>
              <Label htmlFor="port">
                Port
              </Label>
              <Input
                id="port"
                placeholder="5432"
                className="w-full"
                {...register("port", { required: "Port is required" })}
              />
              {errors.port && <p>{errors.port.message}</p>}
            </div>
            
            <div>
              <Label htmlFor="database">
                Database
              </Label>
              <Input
                id="database"
                placeholder="my_database"
                className="w-full"
                {...register("database", { required: "Database name is required" })}
              />
              {errors.database && <p>{errors.database.message}</p>}
            </div>
            
            <div>
              <Label htmlFor="username">
                Username
              </Label>
              <Input
                id="username"
                placeholder="postgres"
                className="w-full"
                {...register("username", { required: "Username is required" })}
              />
              {errors.username && <p>{errors.username.message}</p>}
            </div>
            
            <div>
              <Label htmlFor="password">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                className="w-full"
                {...register("password", { required: "Password is required" })}
              />
              {errors.password && <p>{errors.password.message}</p>}
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" className="w-full">
              Cancel
            </Button>
            <Button type="submit" className="w-full">Connect</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
} 