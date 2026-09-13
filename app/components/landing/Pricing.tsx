"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Check } from "lucide-react";
import Link from "next/link";

const pricingPlans = [
  {
    name: "Free",
    description: "Perfect for trying out Query.io",
    price: "$0",
    billing: "forever",
    features: [
      "Connect 1 database",
      "100 natural language queries/month",
      "Basic visualizations",
      "Community support",
    ],
    cta: "Get Started",
    popular: false,
  },
  {
    name: "Pro",
    description: "For individuals and small teams",
    price: "$29",
    billing: "per month",
    features: [
      "Connect 5 databases",
      "1,000 natural language queries/month",
      "Advanced visualizations",
      "Dashboard creation",
      "Export to CSV/Excel",
      "Email support",
    ],
    cta: "Start Free Trial",
    popular: true,
  },
  {
    name: "Enterprise",
    description: "For organizations with advanced needs",
    price: "Custom",
    billing: "contact us",
    features: [
      "Unlimited database connections",
      "Unlimited queries",
      "Custom integrations",
      "SSO & SAML authentication",
      "Role-based access control",
      "Dedicated support & SLA",
      "On-premise deployment option",
    ],
    cta: "Contact Sales",
    popular: false,
  },
];

export function Pricing() {
  return (
    <section className="w-full py-20 bg-muted">
      <div className="container max-w-7xl">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Simple, Transparent Pricing</h2>
          <p className="mt-4 text-lg text-muted-foreground max-w-3xl mx-auto">
            Choose the plan that's right for you
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {pricingPlans.map((plan, index) => (
            <Card 
              key={index} 
              className={`flex flex-col ${plan.popular ? 'border-primary shadow-lg relative' : ''}`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-0 right-0 flex justify-center">
                  <div className="bg-primary text-primary-foreground px-4 py-1 rounded-full text-sm font-medium">
                    Most Popular
                  </div>
                </div>
              )}
              <CardHeader>
                <CardTitle className="text-2xl">{plan.name}</CardTitle>
                <CardDescription className="text-base">{plan.description}</CardDescription>
              </CardHeader>
              <CardContent className="flex-grow">
                <div className="mb-6">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  <span className="text-muted-foreground ml-2">{plan.billing}</span>
                </div>
                <ul className="space-y-3">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center">
                      <Check className="h-5 w-5 text-primary mr-2 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Button 
                  className={`w-full rounded-full ${plan.popular ? '' : 'bg-secondary hover:bg-secondary-hover'}`}
                  asChild
                >
                  {plan.cta === "Get Started" && (
                    <Link href="/dashboard">{plan.cta}</Link>
                  )}
                  {plan.cta === "Start Free Trial" && (
                    <Link href="/register">{plan.cta}</Link>
                  )}
                  {plan.cta === "Contact Sales" && (
                    <Link href="#contact">{plan.cta}</Link>
                  )}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
} 