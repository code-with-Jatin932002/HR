'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FaChevronRight } from 'react-icons/fa';

const Breadcrumb = () => {
  const pathname = usePathname();
  const segments = pathname.split('/').filter(Boolean);

  const pathLinks = segments.map((segment, index) => {
    const path = '/' + segments.slice(0, index + 1).join('/');
    const label = segment
      .replace(/-/g, ' ')
      .replace(/\b\w/g, (l) => l.toUpperCase());

    return {
      href: path,
      label: label,
    };
  });

  return (
    <nav className="text-sm breadcrumbs my-4">
      <ol className="flex items-center space-x-2 text-gray-600">
        <li>
          {pathname.startsWith('/dashboard') ? (
            <span className="text-blue-600 cursor-not-allowed">Home</span>
          ) : (
            <Link href="/" className="text-blue-600 hover:underline">Home</Link>
          )}
        </li>

        {pathLinks.map((item, index) => (
          <li key={item.href} className="flex items-center">
            <FaChevronRight className="mx-2 text-xs" />
            {index === pathLinks.length - 1 ? (
              <span className="text-gray-500">{item.label}</span>
            ) : (
              <Link href={item.href} className="text-blue-600 hover:underline">
                {item.label}
              </Link>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
};

export default Breadcrumb;
