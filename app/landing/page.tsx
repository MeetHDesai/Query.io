import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { MessageSquare, Database, BarChart2, Shield, ArrowRight, Twitter, Linkedin, Github, Menu } from "lucide-react"

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-black text-white">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-zinc-800 bg-black/95 backdrop-blur supports-[backdrop-filter]:bg-black/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <Image
              src="/placeholder.svg?height=32&width=32"
              alt="QueryIO Logo"
              width={32}
              height={32}
              className="rounded bg-white"
            />
            <span className="text-xl font-bold text-white">QueryIO</span>
          </div>

          {/* Mobile menu button */}
          <div className="block md:hidden">
            <Button variant="ghost" size="icon" className="h-8 w-8 text-white">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle menu</span>
            </Button>
          </div>

          {/* Desktop navigation */}
          <nav className="hidden md:flex items-center gap-6">
            <Link href="#features" className="text-sm font-medium text-zinc-400 hover:text-white transition-colors">
              Features
            </Link>
            <Link href="#testimonials" className="text-sm font-medium text-zinc-400 hover:text-white transition-colors">
              Testimonials
            </Link>
            <Link href="#pricing" className="text-sm font-medium text-zinc-400 hover:text-white transition-colors">
              Pricing
            </Link>
            <Link href="#about" className="text-sm font-medium text-zinc-400 hover:text-white transition-colors">
              About
            </Link>
            <Link href="#contact" className="text-sm font-medium text-zinc-400 hover:text-white transition-colors">
              Contact
            </Link>
            <Button
              asChild
              variant="outline"
              className="ml-2 border-zinc-700 text-white hover:bg-zinc-800 hover:text-white"
            >
              <Link href="/login">Login</Link>
            </Button>
            <Button asChild className="bg-white text-black hover:bg-gray-200">
              <Link href="/dashboard">Get Started</Link>
            </Button>
          </nav>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48 bg-gradient-to-b from-black to-zinc-900">
          <div className="container px-4 md:px-6 mx-auto max-w-7xl">
            <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px]">
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-2">
                  <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none text-white">
                    Unlock Your Data with <span className="text-white">Natural Language</span>
                  </h1>
                  <p className="max-w-[600px] text-zinc-400 md:text-xl">
                    QueryIO empowers non-technical users to interact with databases using simple, conversational
                    language. No SQL knowledge required.
                  </p>
                </div>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  <Button size="lg" className="bg-white text-black hover:bg-gray-200" asChild>
                    <Link href="/register">Try QueryIO Free</Link>
                  </Button>
                  <Button size="lg" variant="outline" className="border-zinc-700 text-white hover:bg-zinc-800" asChild>
                    <Link href="#demo">Watch Demo</Link>
                  </Button>
                </div>
              </div>
              <div className="relative mx-auto aspect-video overflow-hidden rounded-xl border border-zinc-800 shadow-xl lg:order-last">
                <Image
                  src="/placeholder.svg?height=550&width=550"
                  width={550}
                  height={550}
                  alt="QueryIO Dashboard Preview"
                  className="object-cover w-full h-full"
                />
                <div className="absolute inset-0 bg-gradient-to-tr from-black/40 to-transparent"></div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="w-full py-12 md:py-24 lg:py-32 bg-zinc-900">
          <div className="container px-4 md:px-6 mx-auto max-w-7xl">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <div className="inline-block rounded-lg bg-zinc-800 px-3 py-1 text-sm text-white">Features</div>
                <h2 className="text-3xl font-bold tracking-tighter md:text-4xl text-white">
                  Powerful Features, Simple Interface
                </h2>
                <p className="max-w-[900px] text-zinc-400 md:text-xl">
                  QueryIO combines advanced AI with an intuitive interface to make database querying accessible to
                  everyone.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl items-center gap-6 py-12 md:grid-cols-2 lg:grid-cols-4">
              <div className="flex flex-col items-center space-y-4 rounded-lg border border-zinc-800 bg-zinc-900 p-6 shadow-sm transition-all hover:border-zinc-700">
                <div className="rounded-full bg-zinc-800 p-3">
                  <MessageSquare className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white">Natural Language Queries</h3>
                <p className="text-center text-zinc-400">
                  Ask questions in plain English and get accurate database results instantly.
                </p>
              </div>
              <div className="flex flex-col items-center space-y-4 rounded-lg border border-zinc-800 bg-zinc-900 p-6 shadow-sm transition-all hover:border-zinc-700">
                <div className="rounded-full bg-zinc-800 p-3">
                  <Database className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white">Multi-Database Support</h3>
                <p className="text-center text-zinc-400">
                  Connect to MySQL, PostgreSQL, MongoDB, and more with seamless integration.
                </p>
              </div>
              <div className="flex flex-col items-center space-y-4 rounded-lg border border-zinc-800 bg-zinc-900 p-6 shadow-sm transition-all hover:border-zinc-700">
                <div className="rounded-full bg-zinc-800 p-3">
                  <BarChart2 className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white">Data Visualization</h3>
                <p className="text-center text-zinc-400">
                  Automatically generate charts and graphs from your query results.
                </p>
              </div>
              <div className="flex flex-col items-center space-y-4 rounded-lg border border-zinc-800 bg-zinc-900 p-6 shadow-sm transition-all hover:border-zinc-700">
                <div className="rounded-full bg-zinc-800 p-3">
                  <Shield className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white">Secure Access</h3>
                <p className="text-center text-zinc-400">
                  Enterprise-grade security with role-based permissions and data encryption.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="w-full py-12 md:py-24 lg:py-32 bg-black">
          <div className="container px-4 md:px-6 mx-auto max-w-7xl">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <div className="inline-block rounded-lg bg-zinc-800 px-3 py-1 text-sm text-white">How It Works</div>
                <h2 className="text-3xl font-bold tracking-tighter md:text-4xl text-white">
                  From Natural Language to Database Results
                </h2>
                <p className="max-w-[900px] text-zinc-400 md:text-xl">
                  See how QueryIO transforms your questions into powerful database queries.
                </p>
              </div>
            </div>
            <div className="mx-auto mt-12 max-w-5xl">
              <div className="relative rounded-xl border border-zinc-800 bg-zinc-900 p-6 shadow-lg">
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <div className="h-3 w-3 rounded-full bg-red-500"></div>
                    <div className="h-3 w-3 rounded-full bg-yellow-500"></div>
                    <div className="h-3 w-3 rounded-full bg-green-500"></div>
                    <div className="ml-2 text-sm font-medium text-zinc-400">QueryIO Interface</div>
                  </div>
                  <div className="space-y-4">
                    <div className="rounded-lg bg-zinc-800 p-4">
                      <p className="font-medium text-white">
                        "Show me all customers who spent more than $1000 last month"
                      </p>
                    </div>
                    <div className="flex items-center">
                      <div className="h-px flex-1 bg-zinc-700"></div>
                      <span className="mx-2 text-xs text-zinc-500">QueryIO AI translates to SQL</span>
                      <div className="h-px flex-1 bg-zinc-700"></div>
                    </div>
                    <div className="rounded-lg bg-zinc-950 p-4 text-zinc-300 font-mono text-sm">
                      <p>
                        {`SELECT c.name, c.email, SUM(o.total) as total_spent
FROM customers c
JOIN orders o ON c.id = o.customer_id
WHERE o.order_date >= '2023-04-01' AND o.order_date <= '2023-04-30'
GROUP BY c.id
HAVING total_spent > 1000
ORDER BY total_spent DESC;`}
                      </p>
                    </div>
                    <div className="flex items-center">
                      <div className="h-px flex-1 bg-zinc-700"></div>
                      <span className="mx-2 text-xs text-zinc-500">Results</span>
                      <div className="h-px flex-1 bg-zinc-700"></div>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-zinc-800">
                        <thead className="bg-zinc-800">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">
                              Name
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">
                              Email
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">
                              Total Spent
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-zinc-900 divide-y divide-zinc-800">
                          <tr>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">John Smith</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-400">john@example.com</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-white">$2,450.00</td>
                          </tr>
                          <tr>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">
                              Sarah Johnson
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-400">sarah@example.com</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-white">$1,875.50</td>
                          </tr>
                          <tr>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">Michael Chen</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-400">michael@example.com</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-white">$1,340.25</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section id="testimonials" className="w-full py-12 md:py-24 lg:py-32 bg-zinc-900">
          <div className="container px-4 md:px-6 mx-auto max-w-7xl">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <div className="inline-block rounded-lg bg-zinc-800 px-3 py-1 text-sm text-white">Testimonials</div>
                <h2 className="text-3xl font-bold tracking-tighter md:text-4xl text-white">
                  Trusted by Data Teams Everywhere
                </h2>
                <p className="max-w-[900px] text-zinc-400 md:text-xl">
                  See what our customers have to say about how QueryIO has transformed their workflow.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl gap-6 py-12 md:grid-cols-3">
              <div className="flex flex-col justify-between rounded-lg border border-zinc-800 bg-zinc-900 p-6 shadow-sm">
                <div className="space-y-4">
                  <div className="flex items-center">
                    {Array(5)
                      .fill(null)
                      .map((_, i) => (
                        <svg
                          key={i}
                          className="h-5 w-5 fill-current text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                        >
                          <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                        </svg>
                      ))}
                  </div>
                  <p className="text-zinc-300">
                    "QueryIO has democratized data access across our organization. Our marketing team can now get
                    insights without waiting for the data team, saving us countless hours each week."
                  </p>
                </div>
                <div className="mt-6 flex items-center">
                  <Image
                    src="/placeholder.svg?height=40&width=40"
                    width={40}
                    height={40}
                    alt="Jennifer Lee"
                    className="rounded-full"
                  />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-white">Jennifer Lee</p>
                    <p className="text-xs text-zinc-400">CMO, TechGrowth</p>
                  </div>
                </div>
              </div>
              <div className="flex flex-col justify-between rounded-lg border border-zinc-800 bg-zinc-900 p-6 shadow-sm">
                <div className="space-y-4">
                  <div className="flex items-center">
                    {Array(5)
                      .fill(null)
                      .map((_, i) => (
                        <svg
                          key={i}
                          className="h-5 w-5 fill-current text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                        >
                          <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                        </svg>
                      ))}
                  </div>
                  <p className="text-zinc-300">
                    "As a data analyst, I was skeptical about AI-generated SQL. But QueryIO's accuracy is impressive,
                    and it's helped me focus on analysis rather than writing repetitive queries."
                  </p>
                </div>
                <div className="mt-6 flex items-center">
                  <Image
                    src="/placeholder.svg?height=40&width=40"
                    width={40}
                    height={40}
                    alt="Marcus Johnson"
                    className="rounded-full"
                  />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-white">Marcus Johnson</p>
                    <p className="text-xs text-zinc-400">Senior Data Analyst, DataDrive</p>
                  </div>
                </div>
              </div>
              <div className="flex flex-col justify-between rounded-lg border border-zinc-800 bg-zinc-900 p-6 shadow-sm">
                <div className="space-y-4">
                  <div className="flex items-center">
                    {Array(5)
                      .fill(null)
                      .map((_, i) => (
                        <svg
                          key={i}
                          className="h-5 w-5 fill-current text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                        >
                          <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                        </svg>
                      ))}
                  </div>
                  <p className="text-zinc-300">
                    "We integrated QueryIO with our customer support platform, and now our support team can instantly
                    access customer data without learning SQL. Game changer for our response times."
                  </p>
                </div>
                <div className="mt-6 flex items-center">
                  <Image
                    src="/placeholder.svg?height=40&width=40"
                    width={40}
                    height={40}
                    alt="Sophia Rodriguez"
                    className="rounded-full"
                  />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-white">Sophia Rodriguez</p>
                    <p className="text-xs text-zinc-400">CTO, SupportHero</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="w-full py-12 md:py-24 lg:py-32 bg-black">
          <div className="container px-4 md:px-6 mx-auto max-w-7xl">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <div className="inline-block rounded-lg bg-zinc-800 px-3 py-1 text-sm text-white">Pricing</div>
                <h2 className="text-3xl font-bold tracking-tighter md:text-4xl text-white">
                  Simple, Transparent Pricing
                </h2>
                <p className="max-w-[900px] text-zinc-400 md:text-xl">
                  Choose the plan that's right for your team. All plans include a 14-day free trial.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl gap-6 py-12 md:grid-cols-3">
              {/* Starter Plan */}
              <div className="flex flex-col rounded-lg border border-zinc-800 bg-zinc-900 p-6 shadow-sm">
                <div className="space-y-2">
                  <h3 className="text-2xl font-bold text-white">Starter</h3>
                  <p className="text-zinc-400">For individuals and small teams</p>
                </div>
                <div className="mt-4 flex items-baseline">
                  <span className="text-3xl font-bold text-white">$29</span>
                  <span className="ml-1 text-zinc-400">/month</span>
                </div>
                <ul className="mt-6 space-y-2">
                  <li className="flex items-center">
                    <svg
                      className="mr-2 h-4 w-4 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M20 6L9 17l-5-5" />
                    </svg>
                    <span className="text-zinc-300">Up to 3 database connections</span>
                  </li>
                  <li className="flex items-center">
                    <svg
                      className="mr-2 h-4 w-4 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M20 6L9 17l-5-5" />
                    </svg>
                    <span className="text-zinc-300">100 queries per day</span>
                  </li>
                  <li className="flex items-center">
                    <svg
                      className="mr-2 h-4 w-4 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M20 6L9 17l-5-5" />
                    </svg>
                    <span className="text-zinc-300">Basic visualizations</span>
                  </li>
                  <li className="flex items-center">
                    <svg
                      className="mr-2 h-4 w-4 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M20 6L9 17l-5-5" />
                    </svg>
                    <span className="text-zinc-300">Email support</span>
                  </li>
                </ul>
                <Button className="mt-8 bg-white text-black hover:bg-gray-200" asChild>
                  <Link href="/register">Start Free Trial</Link>
                </Button>
              </div>

              {/* Professional Plan */}
              <div className="flex flex-col rounded-lg border border-white bg-zinc-900 p-6 shadow-lg relative">
                <div className="absolute -top-4 left-0 right-0 mx-auto w-fit rounded-full bg-white px-3 py-1 text-xs font-medium text-black">
                  Most Popular
                </div>
                <div className="space-y-2">
                  <h3 className="text-2xl font-bold text-white">Professional</h3>
                  <p className="text-zinc-400">For growing businesses</p>
                </div>
                <div className="mt-4 flex items-baseline">
                  <span className="text-3xl font-bold text-white">$99</span>
                  <span className="ml-1 text-zinc-400">/month</span>
                </div>
                <ul className="mt-6 space-y-2">
                  <li className="flex items-center">
                    <svg
                      className="mr-2 h-4 w-4 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M20 6L9 17l-5-5" />
                    </svg>
                    <span className="text-zinc-300">Up to 10 database connections</span>
                  </li>
                  <li className="flex items-center">
                    <svg
                      className="mr-2 h-4 w-4 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M20 6L9 17l-5-5" />
                    </svg>
                    <span className="text-zinc-300">1,000 queries per day</span>
                  </li>
                  <li className="flex items-center">
                    <svg
                      className="mr-2 h-4 w-4 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M20 6L9 17l-5-5" />
                    </svg>
                    <span className="text-zinc-300">Advanced visualizations</span>
                  </li>
                  <li className="flex items-center">
                    <svg
                      className="mr-2 h-4 w-4 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M20 6L9 17l-5-5" />
                    </svg>
                    <span className="text-zinc-300">Team collaboration features</span>
                  </li>
                  <li className="flex items-center">
                    <svg
                      className="mr-2 h-4 w-4 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M20 6L9 17l-5-5" />
                    </svg>
                    <span className="text-zinc-300">Priority support</span>
                  </li>
                </ul>
                <Button className="mt-8 bg-white text-black hover:bg-gray-200" asChild>
                  <Link href="/register">Start Free Trial</Link>
                </Button>
              </div>

              {/* Enterprise Plan */}
              <div className="flex flex-col rounded-lg border border-zinc-800 bg-zinc-900 p-6 shadow-sm">
                <div className="space-y-2">
                  <h3 className="text-2xl font-bold text-white">Enterprise</h3>
                  <p className="text-zinc-400">For large organizations</p>
                </div>
                <div className="mt-4 flex items-baseline">
                  <span className="text-3xl font-bold text-white">$299</span>
                  <span className="ml-1 text-zinc-400">/month</span>
                </div>
                <ul className="mt-6 space-y-2">
                  <li className="flex items-center">
                    <svg
                      className="mr-2 h-4 w-4 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M20 6L9 17l-5-5" />
                    </svg>
                    <span className="text-zinc-300">Unlimited database connections</span>
                  </li>
                  <li className="flex items-center">
                    <svg
                      className="mr-2 h-4 w-4 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M20 6L9 17l-5-5" />
                    </svg>
                    <span className="text-zinc-300">Unlimited queries</span>
                  </li>
                  <li className="flex items-center">
                    <svg
                      className="mr-2 h-4 w-4 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M20 6L9 17l-5-5" />
                    </svg>
                    <span className="text-zinc-300">Custom visualizations</span>
                  </li>
                  <li className="flex items-center">
                    <svg
                      className="mr-2 h-4 w-4 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M20 6L9 17l-5-5" />
                    </svg>
                    <span className="text-zinc-300">Advanced security features</span>
                  </li>
                  <li className="flex items-center">
                    <svg
                      className="mr-2 h-4 w-4 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M20 6L9 17l-5-5" />
                    </svg>
                    <span className="text-zinc-300">Dedicated account manager</span>
                  </li>
                  <li className="flex items-center">
                    <svg
                      className="mr-2 h-4 w-4 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M20 6L9 17l-5-5" />
                    </svg>
                    <span className="text-zinc-300">24/7 premium support</span>
                  </li>
                </ul>
                <Button className="mt-8 border-white text-white hover:bg-zinc-800" variant="outline" asChild>
                  <Link href="#contact">Contact Sales</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Final CTA Section */}
        <section id="cta" className="w-full py-12 md:py-24 lg:py-32 bg-zinc-900">
          <div className="container px-4 md:px-6 mx-auto max-w-7xl">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter md:text-4xl text-white">
                  Start Querying Your Data Today!
                </h2>
                <p className="max-w-[600px] text-zinc-300 md:text-xl">
                  Join thousands of teams already using QueryIO to unlock insights from their data without writing SQL.
                </p>
              </div>
              <div className="flex flex-col gap-2 min-[400px]:flex-row">
                <Button size="lg" className="bg-white text-black hover:bg-gray-200" asChild>
                  <Link href="/register">
                    Start Your Free Trial
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" className="text-white border-white hover:bg-zinc-800" asChild>
                  <Link href="#demo">Schedule a Demo</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer id="contact" className="w-full border-t border-zinc-800 bg-black py-6 md:py-12">
        <div className="container px-4 md:px-6 mx-auto max-w-7xl">
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Image
                  src="/placeholder.svg?height=32&width=32"
                  alt="QueryIO Logo"
                  width={32}
                  height={32}
                  className="rounded bg-white"
                />
                <span className="text-xl font-bold text-white">QueryIO</span>
              </div>
              <p className="text-sm text-zinc-400">Unlock your data with natural language. No SQL required.</p>
              <div className="flex space-x-4">
                <Link href="#" className="text-zinc-500 hover:text-white">
                  <Twitter className="h-5 w-5" />
                  <span className="sr-only">Twitter</span>
                </Link>
                <Link href="#" className="text-zinc-500 hover:text-white">
                  <Linkedin className="h-5 w-5" />
                  <span className="sr-only">LinkedIn</span>
                </Link>
                <Link href="#" className="text-zinc-500 hover:text-white">
                  <Github className="h-5 w-5" />
                  <span className="sr-only">GitHub</span>
                </Link>
              </div>
            </div>
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-white">Product</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="#features" className="text-zinc-400 hover:text-white">
                    Features
                  </Link>
                </li>
                <li>
                  <Link href="#pricing" className="text-zinc-400 hover:text-white">
                    Pricing
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-zinc-400 hover:text-white">
                    Integrations
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-zinc-400 hover:text-white">
                    Changelog
                  </Link>
                </li>
              </ul>
            </div>
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-white">Resources</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="#" className="text-zinc-400 hover:text-white">
                    Documentation
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-zinc-400 hover:text-white">
                    API Reference
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-zinc-400 hover:text-white">
                    Blog
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-zinc-400 hover:text-white">
                    Support
                  </Link>
                </li>
              </ul>
            </div>
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-white">Company</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="#about" className="text-zinc-400 hover:text-white">
                    About
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-zinc-400 hover:text-white">
                    Careers
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-zinc-400 hover:text-white">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-zinc-400 hover:text-white">
                    Terms of Service
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-8 border-t border-zinc-800 pt-8 text-center text-sm text-zinc-400">
            <p>© {new Date().getFullYear()} QueryIO. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
