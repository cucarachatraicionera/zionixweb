'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';

interface TokenImageProps {
  src: string;
  alt: string;
  width: number;
  height: number;
}

const DEFAULT_IMAGE = '/default-token-icon.svg';

const IPFS_GATEWAYS = [
  'https://ipfs.io/ipfs/',
  'https://cloudflare-ipfs.com/ipfs/',
  'https://ipfs.bytesto.net/ipfs/',
  'https://dweb.link/ipfs/',
  'https://nftstorage.link/ipfs/',
  'https://cf-ipfs.com/ipfs/',
  'https://gateway.pinata.cloud/ipfs/',
  'https://ipfs.fleek.co/ipfs/',
  'https://gateway.ipfs.io/ipfs/',
  'https://ipfs.infura.io/ipfs/',
];

const TokenImage: React.FC<TokenImageProps> = ({ src, alt, width, height }) => {
  const [currentSrc, setCurrentSrc] = useState<string>(DEFAULT_IMAGE);
  const [currentGatewayIndex, setCurrentGatewayIndex] = useState(0);
  const [error, setError] = useState(false);

  const isIpfsLike = (url: string) => {
    if (!url) return false;
    return (
      url.startsWith('ipfs://') ||
      /\/ipfs\//i.test(url) ||
      /https?:\/\/[A-Za-z0-9]+\.ipfs\.[^/]+/i.test(url)
    );
  };

  const convertToGatewayUrl = (url: string, gatewayIndex: number) => {
    if (!url) return DEFAULT_IMAGE;
    const gateway = IPFS_GATEWAYS[gatewayIndex] || IPFS_GATEWAYS[0];
    // ipfs://CID[/path]
    if (url.startsWith('ipfs://')) {
      const hashPath = url.replace('ipfs://', '');
      return `${gateway}${hashPath}`;
    }
    // https://gateway.domain/ipfs/CID[/path]
    const ipfsPathMatch = url.match(/\/ipfs\/([^?#]+)(.*)?$/i);
    if (ipfsPathMatch) {
      const hashPath = `${ipfsPathMatch[1]}${ipfsPathMatch[2] || ''}`;
      return `${gateway}${hashPath}`;
    }
    // https://CID.ipfs.domain[/path]
    const subdomainMatch = url.match(/^https?:\/\/([A-Za-z0-9]+)\.ipfs\.[^/]+(\/.*)?$/i);
    if (subdomainMatch) {
      const cid = subdomainMatch[1];
      const tail = subdomainMatch[2] || '';
      return `${gateway}${cid}${tail}`;
    }
    return url;
  };

  useEffect(() => {
    if (!src) {
      setCurrentSrc(DEFAULT_IMAGE);
      return;
    }

    // Handle local file paths
    if (src.startsWith('file://')) {
      setCurrentSrc(DEFAULT_IMAGE);
      return;
    }

    // Normalize IPFS-like URLs into a stable gateway
    const normalized = convertToGatewayUrl(src, currentGatewayIndex);
    setCurrentSrc(normalized);
  }, [src, currentGatewayIndex]);

  const handleError = () => {
    if (isIpfsLike(src) && currentGatewayIndex < IPFS_GATEWAYS.length - 1) {
      setCurrentGatewayIndex(prev => prev + 1);
      return;
    }
    // Fallback to default image
    setCurrentSrc(DEFAULT_IMAGE);
    setError(true);
  };

  return (
    <Image
      src={currentSrc}
      alt={alt}
      width={width}
      height={height}
      onError={handleError}
      style={{
        objectFit: 'cover',
        width: '100%',
        height: '100%',
      }}
      unoptimized
    />
  );
};

export default TokenImage; 