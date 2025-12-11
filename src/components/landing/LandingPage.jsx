import { useState, useEffect } from 'react'
import { 
  CheckIcon, 
  XMarkIcon,
  LockClosedIcon,
  ShieldCheckIcon,
  ServerIcon,
  CloudIcon,
  RocketLaunchIcon,
  CreditCardIcon,
  CalendarIcon,
  BoltIcon
} from '@heroicons/react/24/outline'

const PricingUpgradePage = () => {
  const [isVisible, setIsVisible] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState('standard')

  useEffect(() => {
    setIsVisible(true)
  }, [])

  const deploymentPlans = [
    {
      id: 'basic',
      name: 'Basic Deployment',
      description: 'Shared hosting for small municipalities',
      price: 29,
      icon: CloudIcon,
      color: 'blue',
      features: [
        { name: 'Shared server resources', included: true },
        { name: '99.5% uptime guarantee', included: true },
        { name: '50GB storage', included: true },
        { name: '500GB bandwidth', included: true },
        { name: 'SSL certificate included', included: true },
        { name: 'Daily backups', included: true },
        { name: 'Email support', included: true },
        { name: 'Dedicated IP address', included: false },
        { name: 'Priority support', included: false },
        { name: 'Custom domain setup', included: false }
      ]
    },
    {
      id: 'standard',
      name: 'Standard Deployment',
      description: 'Optimized hosting for active use',
      price: 79,
      icon: ServerIcon,
      color: 'green',
      popular: true,
      features: [
        { name: 'Dedicated server resources', included: true },
        { name: '99.9% uptime guarantee', included: true },
        { name: '200GB SSD storage', included: true },
        { name: '2TB bandwidth', included: true },
        { name: 'SSL certificate included', included: true },
        { name: 'Hourly backups', included: true },
        { name: 'Priority email & phone support', included: true },
        { name: 'Dedicated IP address', included: true },
        { name: 'Custom domain setup', included: true },
        { name: 'CDN integration', included: true }
      ]
    },
    {
      id: 'premium',
      name: 'Premium Deployment',
      description: 'Enterprise-grade infrastructure',
      price: 199,
      icon: RocketLaunchIcon,
      color: 'purple',
      features: [
        { name: 'High-performance cloud servers', included: true },
        { name: '99.99% uptime SLA', included: true },
        { name: '1TB SSD storage', included: true },
        { name: 'Unlimited bandwidth', included: true },
        { name: 'Advanced SSL & security', included: true },
        { name: 'Real-time backups', included: true },
        { name: '24/7 priority support', included: true },
        { name: 'Multiple dedicated IPs', included: true },
        { name: 'Custom domain & DNS management', included: true },
        { name: 'Global CDN & DDoS protection', included: true }
      ]
    }
  ]

  const getColorClasses = (color) => {
    const colors = {
      blue: {
        bg: 'bg-blue-600',
        hover: 'hover:bg-blue-700',
        border: 'border-blue-500',
        text: 'text-blue-600',
        lightBg: 'bg-blue-50',
        gradient: 'from-blue-600 to-blue-700'
      },
      green: {
        bg: 'bg-green-600',
        hover: 'hover:bg-green-700',
        border: 'border-green-500',
        text: 'text-green-600',
        lightBg: 'bg-green-50',
        gradient: 'from-green-600 to-emerald-600'
      },
      purple: {
        bg: 'bg-purple-600',
        hover: 'hover:bg-purple-700',
        border: 'border-purple-500',
        text: 'text-purple-600',
        lightBg: 'bg-purple-50',
        gradient: 'from-purple-600 to-purple-700'
      }
    }
    return colors[color]
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Lock Banner */}
      <div className="bg-gradient-to-r from-red-600 via-orange-600 to-red-600 text-white py-6 shadow-2xl border-b-4 border-red-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-center text-center md:text-left gap-4">
            <div className="flex items-center">
              <LockClosedIcon className="h-8 w-8 mr-3 animate-pulse" />
              <div>
                <p className="text-2xl font-bold">Service Suspended</p>
                <p className="text-sm text-red-100">Deployment payment required for December 2024</p>
              </div>
            </div>
            <div className="flex items-center bg-white/20 px-6 py-3 rounded-lg backdrop-blur-sm">
              <CalendarIcon className="h-5 w-5 mr-2" />
              <span className="font-semibold">Due: December 31, 2024</span>
            </div>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <section className="relative py-16 overflow-hidden">
        <div className="absolute inset-0 overflow-hidden opacity-20">
          <div className="absolute top-20 left-1/4 w-96 h-96 bg-green-500 rounded-full mix-blend-multiply filter blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-1/4 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div 
            className={`text-center transform transition-all duration-1000 ${
              isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
            }`}
          >
            <div className="inline-flex items-center justify-center p-4 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl mb-6 shadow-2xl">
              <ServerIcon className="h-12 w-12 text-white" />
            </div>
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
              Resume Your Service
            </h1>
            <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed">
              Select a deployment plan to restore access to SANGBO BERDE and continue transforming waste management in your community.
            </p>
            <div className="flex items-center justify-center gap-3 text-gray-400">
              <ShieldCheckIcon className="h-5 w-5 text-green-400" />
              <span>Secure Payment Processing</span>
              <span className="text-gray-600">•</span>
              <BoltIcon className="h-5 w-5 text-green-400" />
              <span>Instant Activation</span>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {deploymentPlans.map((plan, index) => {
              const colors = getColorClasses(plan.color)
              const IconComponent = plan.icon
              
              return (
                <div
                  key={plan.id}
                  className={`relative bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl shadow-2xl overflow-hidden transform transition-all duration-500 hover:scale-105 ${
                    plan.popular ? 'ring-4 ring-green-500 ring-opacity-50' : ''
                  }`}
                  style={{
                    animationDelay: `${index * 200}ms`,
                    animation: isVisible ? 'fadeIn 0.8s ease-out forwards' : 'none'
                  }}
                >
                  {plan.popular && (
                    <div className="absolute top-0 right-0 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-2 text-sm font-bold rounded-bl-2xl shadow-lg">
                      MOST POPULAR
                    </div>
                  )}

                  <div className="p-8">
                    <div className={`inline-flex p-4 ${colors.lightBg} rounded-xl mb-4`}>
                      <IconComponent className={`h-8 w-8 ${colors.text}`} />
                    </div>
                    
                    <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
                    <p className="text-gray-400 mb-6">{plan.description}</p>
                    
                    <div className="mb-8">
                      <div className="flex items-baseline">
                        <span className="text-5xl font-bold text-white">${plan.price}</span>
                        <span className="text-gray-400 ml-2">/month</span>
                      </div>
                      <p className="text-sm text-gray-500 mt-2">Billed monthly • Cancel anytime</p>
                    </div>

                    <button
                      onClick={() => setSelectedPlan(plan.id)}
                      className={`w-full ${colors.bg} ${colors.hover} text-white py-4 px-6 rounded-xl font-semibold text-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl mb-8 flex items-center justify-center gap-2`}
                    >
                      <CreditCardIcon className="h-5 w-5" />
                      Pay & Activate Now
                    </button>

                    <div className="space-y-4">
                      {plan.features.map((feature, featureIndex) => (
                        <div
                          key={featureIndex}
                          className="flex items-start group"
                        >
                          {feature.included ? (
                            <div className="flex-shrink-0 p-1 bg-green-500 rounded-full mr-3 group-hover:scale-110 transition-transform duration-300">
                              <CheckIcon className="h-4 w-4 text-white" />
                            </div>
                          ) : (
                            <div className="flex-shrink-0 p-1 bg-gray-700 rounded-full mr-3">
                              <XMarkIcon className="h-4 w-4 text-gray-500" />
                            </div>
                          )}
                          <span className={`text-sm ${feature.included ? 'text-gray-300' : 'text-gray-600'} group-hover:text-white transition-colors duration-300`}>
                            {feature.name}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Payment Information */}
      <section className="py-16 bg-gradient-to-br from-gray-800 to-gray-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-br from-gray-700 to-gray-800 rounded-2xl shadow-2xl p-8 border border-gray-600">
            <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
              <CreditCardIcon className="h-8 w-8 text-green-400" />
              Payment Information
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-gray-300">
              <div>
                <h4 className="font-semibold text-white mb-3">Accepted Payment Methods:</h4>
                <ul className="space-y-2">
                  <li className="flex items-center gap-2">
                    <CheckIcon className="h-5 w-5 text-green-400" />
                    Credit/Debit Cards (Visa, Mastercard, Amex)
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckIcon className="h-5 w-5 text-green-400" />
                    PayPal & Digital Wallets
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckIcon className="h-5 w-5 text-green-400" />
                    Bank Transfer
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckIcon className="h-5 w-5 text-green-400" />
                    Cryptocurrency (BTC, ETH)
                  </li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-semibold text-white mb-3">What Happens After Payment:</h4>
                <ul className="space-y-2">
                  <li className="flex items-center gap-2">
                    <BoltIcon className="h-5 w-5 text-green-400" />
                    Instant service activation
                  </li>
                  <li className="flex items-center gap-2">
                    <BoltIcon className="h-5 w-5 text-green-400" />
                    Full access restored immediately
                  </li>
                  <li className="flex items-center gap-2">
                    <BoltIcon className="h-5 w-5 text-green-400" />
                    Automatic renewal setup
                  </li>
                  <li className="flex items-center gap-2">
                    <BoltIcon className="h-5 w-5 text-green-400" />
                    Email confirmation & receipt
                  </li>
                </ul>
              </div>
            </div>

            <div className="mt-8 p-6 bg-gray-900/50 rounded-xl border border-gray-600">
              <p className="text-sm text-gray-400 flex items-start gap-2">
                <ShieldCheckIcon className="h-5 w-5 text-green-400 flex-shrink-0 mt-0.5" />
                <span>
                  Your payment information is encrypted and secure. We use industry-standard SSL encryption 
                  and comply with PCI DSS standards. Cancel anytime without penalties.
                </span>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-white text-center mb-12">
            Frequently Asked Questions
          </h2>
          
          <div className="space-y-6">
            {[
              {
                q: "Why was my service suspended?",
                a: "Your deployment payment for December 2024 is overdue. Web hosting and infrastructure require monthly payments to maintain service availability."
              },
              {
                q: "How quickly will my service be restored?",
                a: "Upon successful payment, your service will be reactivated immediately. You should have full access within minutes."
              },
              {
                q: "Can I switch plans later?",
                a: "Yes! You can upgrade or downgrade your deployment plan at any time. Changes take effect at the start of your next billing cycle."
              },
              {
                q: "What if I need a custom solution?",
                a: "Contact our team at info@sangboberde.com for enterprise custom deployment options with dedicated resources and SLA guarantees."
              }
            ].map((faq, index) => (
              <div
                key={index}
                className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-6 border border-gray-700 hover:border-green-500 transition-all duration-300"
              >
                <h3 className="text-lg font-semibold text-white mb-2">{faq.q}</h3>
                <p className="text-gray-400">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Support */}
      <section className="py-16 bg-gradient-to-r from-green-600 to-emerald-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Need Help?
          </h2>
          <p className="text-xl text-green-100 mb-8">
            Our support team is here to assist you with payment or technical questions.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="mailto:info@sangboberde.com"
              className="bg-white text-green-600 px-8 py-4 rounded-xl font-semibold hover:bg-gray-100 transition-all duration-300 transform hover:scale-105 shadow-lg"
            >
              Email Support
            </a>
            <a
              href="tel:+639938190512"
              className="bg-green-700 text-white px-8 py-4 rounded-xl font-semibold hover:bg-green-800 transition-all duration-300 transform hover:scale-105 shadow-lg"
            >
              Call Us
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 border-t border-gray-800 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-gray-400">
            &copy; 2024 SANGBO BERDE. All rights reserved.
          </p>
          <p className="text-gray-600 text-sm mt-2">
            Plaza Maetro Commercial Complex, Vigan City, Ilocos Sur
          </p>
        </div>
      </footer>
    </div>
  )
}

export default PricingUpgradePage
