'use client'

import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'

const Hero = () => {
  const leftAnimation = {
    initial: { x: '-100%', opacity: 0 },
    animate: { x: 0, opacity: 1 },
    exit: { x: '-100%', opacity: 0 },
    transition: { duration: 0.6 },
  }

  const rightAnimation = {
    initial: { x: '100%', opacity: 0 },
    animate: { x: 0, opacity: 1 },
    exit: { x: '100%', opacity: 0 },
    transition: { duration: 0.6 },
  }

  const handleBuyNow = () => {
    const element = document.getElementById('dex')
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  return (
    <section
      className="relative md:pt-10 md:pb-28 py-20 overflow-hidden z-1 bg-darkmode"
      id="hero"
    >
      <div className="container px-4 mx-auto">
        <div className="grid grid-cols-12 items-center gap-8">
          <motion.div 
            {...leftAnimation} 
            className="lg:col-span-6 col-span-12"
          >
            <div className="flex gap-6 items-center lg:justify-start justify-center mb-5">
              <Image
                src="/images/icons/icon-bag.svg"
                alt="icon"
                width={40}
                height={40}
                className="animate-float"
              />
              <p className="text-white sm:text-28 text-18 mb-0">
                Zionix — Next-gen <span className="text-primary">DeFi Platform</span>
              </p>
            </div>

            <h1 className="font-medium lg:text-76 md:text-70 text-54 lg:text-start text-center text-white mb-10 leading-tight">
              Democratizing <span className="text-primary">DeFi Access</span> <br />
              with Speed and User-Friendly Tools
            </h1>

            <p className="text-muted text-white sm:text-lg text-base lg:text-left text-center max-w-xl mb-10">
              Zionix brings fast, automated, and easy-to-use DeFi tools on Solana for all users. Access powerful trading, staking, and exclusive features via our native token{' '}
              <span className="text-primary font-semibold">ZXT</span>.
            </p>

            <div className="flex justify-center lg:justify-start gap-4">
              <button
                className="bg-primary border border-primary rounded-lg text-21 font-medium hover:bg-transparent hover:text-primary text-darkmode py-3 px-10 transition duration-300"
                onClick={handleBuyNow}
              >
                Buy Now!
              </button>
              <Link
                href="/#roadmap"
                className="border border-primary rounded-lg text-21 font-medium text-primary hover:bg-primary hover:text-darkmode py-3 px-10 transition duration-300"
              >
                Learn More
              </Link>
            </div>
          </motion.div>

          <motion.div
            {...rightAnimation}
            className="lg:col-span-6 col-span-12 lg:flex hidden justify-end items-center relative"
          >
            <div className="relative w-full max-w-[600px] aspect-square">
              <Image
                src="/images/hero/banner-image.png"
                alt="Banner"
                fill
                className="object-contain animate-float"
                priority
              />
              {/* Decorative elements */}
              <div className="absolute w-32 h-32 bg-primary/20 rounded-full blur-3xl top-1/4 -left-8 animate-pulse" />
              <div className="absolute w-24 h-24 bg-primary/20 rounded-full blur-2xl bottom-1/4 right-0 animate-pulse delay-300" />
            </div>
          </motion.div>
        </div>
      </div>

      {/* Background effects */}
      <div className="absolute w-[500px] h-[500px] bg-primary/20 blur-[120px] rounded-full -top-1/4 -right-1/4 animate-pulse" />
      <div className="absolute w-[300px] h-[300px] bg-primary/20 blur-[100px] rounded-full bottom-0 left-1/2 transform -translate-x-1/2" />
    </section>
  )
}

export default Hero
