"use client"

import { Switch } from "@/components/ui/switch"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Database } from "lucide-react"

export default function SettingsPage() {
  const [isSaving, setIsSaving] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)

    // Simulate saving
    setTimeout(() => {
      setIsSaving(false)
    }, 1000)
  }

  return (
    <div className="flex min-h-screen flex-col bg-black text-white">
      <header className="sticky top-0 z-50 w-full border-b border-zinc-800 bg-black/95 backdrop-blur supports-[backdrop-filter]:bg-black/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <Link href="/dashboard" className="flex items-center gap-2">
              <ArrowLeft className="h-5 w-5" />
              <span className="sr-only md:not-sr-only md:inline">Back to Dashboard</span>
            </Link>
          </div>
          <div className="flex items-center gap-2">
            <Image
              src="/placeholder.svg?height=32&width=32"
              alt="QueryIO Logo"
              width={32}
              height={32}
              className="rounded bg-white"
            />
            <span className="text-xl font-bold">QueryIO</span>
          </div>
          <div className="flex items-center gap-4">
            <Button className="bg-white hover:bg-gray-200 text-black" onClick={handleSubmit} disabled={isSaving}>
              {isSaving ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1 container py-6">
        <div className="flex flex-col md:flex-row gap-8">
          <div className="md:w-64 space-y-6">
            <div className="flex flex-col items-center p-6 bg-[#121212] rounded-lg border border-zinc-800">
              <div className="relative w-24 h-24 mb-4">
                <Image
                  src="/placeholder.svg?height=96&width=96"
                  alt="Profile"
                  width={96}
                  height={96}
                  className="rounded-full bg-zinc-800"
                />
                <Button className="absolute bottom-0 right-0 h-8 w-8 rounded-full bg-white text-black hover:bg-gray-200 p-0">
                  <span className="sr-only">Change avatar</span>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-4 w-4"
                  >
                    <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
                  </svg>
                </Button>
              </div>
              <h2 className="text-lg font-medium">John Doe</h2>
              <p className="text-sm text-zinc-400">john@example.com</p>
              <p className="text-xs text-zinc-500 mt-1">Professional Plan</p>
            </div>
          </div>

          <div className="flex-1 space-y-6">
            <div className="space-y-0.5">
              <h2 className="text-2xl font-bold">Settings</h2>
              <p className="text-zinc-400">Manage your account information and preferences.</p>
            </div>

            {/* Include all content from both tabs here, without the tabs wrapper */}
            {/* Personal Information section */}
            <div className="space-y-4 rounded-lg border border-zinc-800 p-6 bg-[#121212]">
              <h3 className="text-lg font-medium">Personal Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input id="firstName" defaultValue="John" className="bg-[#1a1a1a] border-zinc-700 text-white" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input id="lastName" defaultValue="Doe" className="bg-[#1a1a1a] border-zinc-700 text-white" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    defaultValue="john@example.com"
                    className="bg-[#1a1a1a] border-zinc-700 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+1 (555) 000-0000"
                    className="bg-[#1a1a1a] border-zinc-700 text-white"
                  />
                </div>
              </div>
            </div>

            {/* Company Information section */}
            <div className="space-y-4 rounded-lg border border-zinc-800 p-6 bg-[#121212]">
              <h3 className="text-lg font-medium">Company Information</h3>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="companyName">Company Name</Label>
                  <Input id="companyName" placeholder="Acme Inc." className="bg-[#1a1a1a] border-zinc-700 text-white" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="jobTitle">Job Title</Label>
                  <Input id="jobTitle" placeholder="Data Analyst" className="bg-[#1a1a1a] border-zinc-700 text-white" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="industry">Industry</Label>
                  <Select>
                    <SelectTrigger className="bg-[#1a1a1a] border-zinc-700 text-white">
                      <SelectValue placeholder="Select industry" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#1a1a1a] border-zinc-700 text-white">
                      <SelectItem value="technology">Technology</SelectItem>
                      <SelectItem value="finance">Finance</SelectItem>
                      <SelectItem value="healthcare">Healthcare</SelectItem>
                      <SelectItem value="education">Education</SelectItem>
                      <SelectItem value="retail">Retail</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Subscription Plan section */}
            <div className="space-y-4 rounded-lg border border-zinc-800 p-6 bg-[#121212]">
              <h3 className="text-lg font-medium">Subscription Plan</h3>
              <div className="flex items-center justify-between p-4 rounded-lg bg-[#1a1a1a]">
                <div>
                  <h4 className="font-medium">Professional Plan</h4>
                  <p className="text-sm text-zinc-400">$99/month, billed monthly</p>
                  <ul className="text-xs text-zinc-500 mt-2 space-y-1">
                    <li>• Up to 10 database connections</li>
                    <li>• 1,000 queries per day</li>
                    <li>• Advanced visualizations</li>
                    <li>• Team collaboration features</li>
                  </ul>
                </div>
                <Button variant="outline" className="border-zinc-700 text-white hover:bg-zinc-700">
                  Change Plan
                </Button>
              </div>
            </div>

            {/* Payment Methods section */}
            <div className="space-y-4 rounded-lg border border-zinc-800 p-6 bg-[#121212]">
              <h3 className="text-lg font-medium">Payment Methods</h3>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-16 rounded bg-zinc-800 flex items-center justify-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="text-white"
                    >
                      <rect width="20" height="14" x="2" y="5" rx="2" />
                      <line x1="2" x2="22" y1="10" y2="10" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium">Visa ending in 4242</p>
                    <p className="text-sm text-zinc-400">Expires 12/2025</p>
                  </div>
                </div>
                <Button variant="outline" className="border-zinc-700 text-white hover:bg-zinc-700">
                  Add Payment Method
                </Button>
              </div>
            </div>

            {/* Database Connections section */}
            <div className="space-y-4 rounded-lg border border-zinc-800 p-6 bg-[#121212]">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">Database Connections</h3>
                <Button className="bg-white hover:bg-gray-200 text-black">Add New Connection</Button>
              </div>

              <div className="space-y-4 mt-4">
                <div className="p-4 rounded-lg border border-zinc-800 bg-[#1a1a1a]">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-white text-black flex items-center justify-center">
                        <Database className="h-5 w-5" />
                      </div>
                      <div>
                        <h4 className="font-medium">Product Database</h4>
                        <p className="text-sm text-zinc-400">PostgreSQL • db.example.com</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-green-500"></div>
                      <span className="text-sm text-zinc-400">Connected</span>
                    </div>
                  </div>
                  <div className="flex justify-end gap-2 mt-4">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 text-xs border-zinc-700 text-zinc-400 hover:bg-zinc-800"
                    >
                      Test
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 text-xs border-zinc-700 text-zinc-400 hover:bg-zinc-800"
                    >
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 text-xs border-zinc-700 text-zinc-400 hover:bg-zinc-800"
                    >
                      Delete
                    </Button>
                  </div>
                </div>

                <div className="p-4 rounded-lg border border-zinc-800 bg-[#1a1a1a]">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-white text-black flex items-center justify-center">
                        <Database className="h-5 w-5" />
                      </div>
                      <div>
                        <h4 className="font-medium">Customer Analytics</h4>
                        <p className="text-sm text-zinc-400">MySQL • analytics.example.com</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-green-500"></div>
                      <span className="text-sm text-zinc-400">Connected</span>
                    </div>
                  </div>
                  <div className="flex justify-end gap-2 mt-4">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 text-xs border-zinc-700 text-zinc-400 hover:bg-zinc-800"
                    >
                      Test
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 text-xs border-zinc-700 text-zinc-400 hover:bg-zinc-800"
                    >
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 text-xs border-zinc-700 text-zinc-400 hover:bg-zinc-800"
                    >
                      Delete
                    </Button>
                  </div>
                </div>

                <div className="p-4 rounded-lg border border-zinc-800 bg-[#1a1a1a]">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-white text-black flex items-center justify-center">
                        <Database className="h-5 w-5" />
                      </div>
                      <div>
                        <h4 className="font-medium">Marketing Data</h4>
                        <p className="text-sm text-zinc-400">MongoDB • mongo.example.com</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-red-500"></div>
                      <span className="text-sm text-zinc-400">Disconnected</span>
                    </div>
                  </div>
                  <div className="flex justify-end gap-2 mt-4">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 text-xs border-zinc-700 text-zinc-400 hover:bg-zinc-800"
                    >
                      Test
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 text-xs border-zinc-700 text-zinc-400 hover:bg-zinc-800"
                    >
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 text-xs border-zinc-700 text-zinc-400 hover:bg-zinc-800"
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Preferences section */}
            <div className="space-y-4 rounded-lg border border-zinc-800 p-6 bg-[#121212]">
              <h3 className="text-lg font-medium">Preferences</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Dark Mode</Label>
                    <p className="text-sm text-zinc-400">Use dark theme across the application</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Language</Label>
                    <p className="text-sm text-zinc-400">Select your preferred language</p>
                  </div>
                  <Select defaultValue="en">
                    <SelectTrigger className="w-[180px] bg-[#1a1a1a] border-zinc-700 text-white">
                      <SelectValue placeholder="Select language" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#1a1a1a] border-zinc-700 text-white">
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="es">Spanish</SelectItem>
                      <SelectItem value="fr">French</SelectItem>
                      <SelectItem value="de">German</SelectItem>
                      <SelectItem value="zh">Chinese</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
