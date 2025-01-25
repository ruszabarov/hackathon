import { InboxArrowDownIcon } from "@heroicons/react/24/solid"
import Image from "next/image"
import Link from "next/link"

const TopNav = () => {
  return (
    <nav className="flex w-full items-center justify-between border-b border-zinc-700 p-4 text-xl font-semibold">
      <Link href="/" className="flex items-center">
			<InboxArrowDownIcon className="w-6 h-6" />
        <span className="ml-2 text-xl font-bold">InboxGenius</span>
      </Link>
      <Link href="/account">
        <Image src="/profile-pic.png" alt="Profile" width={40} height={40} className="rounded-full" />
      </Link>
    </nav>
  )
}

export default TopNav
