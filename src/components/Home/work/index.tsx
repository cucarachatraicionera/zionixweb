'use client'
import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'
import styles from './Work.module.css'

const Work = () => {
  const ref = useRef(null)
  const inView = useInView(ref)

  const fadeInUp = {
    initial: { y: 30, opacity: 0 },
    animate: inView ? { y: 0, opacity: 1 } : { y: 30, opacity: 0 },
    transition: { duration: 0.6, delay: 0.2 },
  }

  const roadmapItems = [
    {
      status: 'Live Now',
      title: 'Current Products',
      description: (
        <>
          <div className={styles.liveProducts}>
            <div className={styles.liveProduct}>
              <h4>Zionix DEX Scanner</h4>
              <p>Powerful tool scanning Solana DEXs for best liquidity pools & rates in real time.</p>
            </div>
            <div className={styles.liveProduct}>
              <h4>Zionix Sniper Bot</h4>
              <p>Lightning-fast bot to snipe new tokens directly from Telegram.</p>
            </div>
          </div>
        </>
      ),
      statusClass: styles.statusGreen,
      color: '#14f195'
    },
    {
      status: 'May 2025',
      title: 'Launch of Zionix Token (ZXT)',
      description: 'Official public release and distribution of ZXT, powering the Zionix ecosystem.',
      statusClass: styles.statusYellow,
      color: '#f59e0b'
    },
    {
      status: 'Q4 2025 – Q1 2026',
      title: 'Zionix Multichain Wallet',
      description: (
        <>
          Secure, easy-to-use wallet supporting multiple blockchains, featuring:
          <ul className={styles.descriptionList}>
            <li>Token management & swaps</li>
            <li>Integrated staking</li>
            <li>P2P marketplace for user-to-user trades</li>
            <li>OTC services for large volume deals with trusted partners</li>
          </ul>
        </>
      ),
      statusClass: styles.statusBlue,
      color: '#3b82f6'
    },
    {
      status: 'Coming Soon',
      title: 'Zionix DeFi Futures',
      description: 'Decentralized futures trading platform with transparency, no intermediaries & high-speed execution.',
      statusClass: styles.statusPurple,
      color: '#8b5cf6'
    },
  ]

  return (
    <section className="relative md:pt-10 md:pb-28 py-20 overflow-hidden z-1 bg-darkmode">
      <div className={styles.containerRoadmap} id="roadmap">
        <motion.h2
          {...fadeInUp}
          className="text-white text-4xl sm:text-5xl font-bold font-space-grotesk mb-12 text-center"
        >
          ROADMAP
        </motion.h2>

        <div className={styles.roadmapGrid} ref={ref}>
          {/* Connecting line with moving light */}
          <div className={styles.connectingLine}>
            <div className={styles.movingLight} />
          </div>

          {roadmapItems.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className={styles.roadmapItem}
              data-status-color={item.color}
            >
              <span className={`${styles.status} ${item.statusClass}`}>
                {item.status}
              </span>
              <h3 className={styles.title}>{item.title}</h3>
              <div className={styles.description}>{item.description}</div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Background effects */}
      <div className="absolute w-[300px] h-[300px] bg-primary blur-[180px] opacity-20 rounded-full -top-40 -right-20 -z-10" />
      <div className="absolute w-[300px] h-[300px] bg-primary blur-[180px] opacity-20 rounded-full bottom-0 left-1/2 transform -translate-x-1/2 -z-10" />
    </section>
  )
}

export default Work
