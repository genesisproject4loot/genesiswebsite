export function shortenAddress(address) {
    if (!address) return ''
  return address.slice(0, 3) + "..." + address.slice(-3);
}
