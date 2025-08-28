'use client'
import Tokenomics from '../Tokenomics'

const TimeLine = () => {
  return (
    <section className="relative md:pt-10 md:pb-28 py-20 overflow-hidden z-1 bg-darkmode" id="tokenomics">
      <Tokenomics />
      
      {/* Background effects */}
      <div className="absolute w-[300px] h-[300px] bg-primary blur-[180px] opacity-20 rounded-full -top-40 left-0 -z-10" />
      <div className="absolute w-[300px] h-[300px] bg-primary blur-[180px] opacity-20 rounded-full top-1/2 -right-20 transform -translate-y-1/2 -z-10" />
    </section>
  )
}

export default TimeLine
