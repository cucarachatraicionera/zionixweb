'use client'

import { motion } from 'framer-motion'
import styles from './Tokenomics.module.css'

const Tokenomics = () => {
  const tokenInfo = {
    name: 'Zionix',
    ticker: 'ZXT',
    blockchain: 'Solana',
    totalSupply: '1,000,000,000 ZXT',
    distribution: [
      {
        percentage: 60,
        title: 'Future Listings & Liquidity',
        description: 'Future listings, integrations, and liquidity support',
        color: '#14f195'
      },
      {
        percentage: 20,
        title: 'Pre-sale',
        description: 'Initial token offering to early supporters',
        color: '#3b82f6'
      },
      {
        percentage: 10,
        title: 'Team',
        description: 'Locked with vesting schedule',
        color: '#8b5cf6'
      },
      {
        percentage: 10,
        title: 'Marketing',
        description: 'Marketing & Strategic Partnerships',
        color: '#f59e0b'
      }
    ]
  }

  return (
    <div className={styles.container}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className={styles.content}
      >
        <div className={styles.header}>
          <h2 className={styles.title}>
            Tokenomics <span className={styles.ticker}>$ZXT</span>
          </h2>
          <div className={styles.supplyInfo}>
            <div className={styles.supplyAmount}>
              <span className={styles.value}>{tokenInfo.totalSupply}</span>
              <span className={styles.label}>Total Supply</span>
            </div>
            <div className={styles.blockchainBadge}>
              <span className={styles.dot}></span>
              {tokenInfo.blockchain}
            </div>
          </div>
        </div>

        <div className={styles.distributionGrid}>
          {tokenInfo.distribution.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className={styles.distributionItem}
            >
              <div className={styles.distributionHeader}>
                <span 
                  className={styles.percentageBadge}
                  style={{ backgroundColor: `${item.color}15`, color: item.color }}
                >
                  {item.percentage}%
                </span>
                <h3 className={styles.distributionTitle}>{item.title}</h3>
              </div>
              
              <motion.div 
                className={styles.barContainer}
                initial={{ width: 0 }}
                whileInView={{ width: '100%' }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
              >
                <motion.div
                  className={styles.bar}
                  style={{ 
                    width: `${item.percentage}%`,
                    backgroundColor: item.color
                  }}
                  whileHover={{ 
                    scale: 1.01,
                    transition: { duration: 0.2 }
                  }}
                />
              </motion.div>
              
              <p className={styles.distributionDescription}>
                {item.description}
              </p>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  )
}

export default Tokenomics
