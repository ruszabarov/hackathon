import Link from "next/link"

const SideNav = () => {
  return (
    <nav className="bg-black text-white w-64 h-full py-4 px-2">
      <ul className="space-y-2">
        <li>
          <Link href="" className="block px-4 py-2 rounded hover:bg-gray-700">
            Gmail
          </Link>
        </li>
        <li>
          <Link href="" className="block px-4 py-2 rounded hover:bg-gray-700">
            Google Calendar
          </Link>
        </li>
      </ul>
    </nav>
  )
}

export default SideNav