import Link from "next/link";
import React from "react";

interface Crumb {
  name: string;
  href?: string;
}

interface BreadcrumbProps {
  crumbs?: Crumb[]; // Optional now
}

const PageBreadcrumb: React.FC<BreadcrumbProps> = ({ crumbs = [] }) => {
  return (
    <div className="flex flex-wrap items-center justify-baseline gap-3 mb-6">
      <h2 className="text-xl font-semibold text-gray-800 dark:text-white/90">
        {/* {lastCrumb} */}
      </h2>
      <nav>
        <ol className="flex items-center gap-1.5">
          {crumbs.map((crumb, index) => (
            <li key={index} className="flex items-center gap-1.5">
              {crumb.href ? (
                <Link
                  href={crumb.href}
                  className="inline-flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400"
                >
                  {crumb.name}
                  <svg
                    className="stroke-current"
                    width="17"
                    height="16"
                    viewBox="0 0 17 16"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M6.0765 12.667L10.2432 8.50033L6.0765 4.33366"
                      stroke="currentColor"
                      strokeWidth="1.2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </Link>
              ) : (
                <span className="text-sm text-gray-800 dark:text-white/90">
                  {crumb.name}
                </span>
              )}
            </li>
          ))}
        </ol>
      </nav>
    </div>
  );
};

export default PageBreadcrumb;
