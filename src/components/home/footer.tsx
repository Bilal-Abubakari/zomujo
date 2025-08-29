import { JSX } from 'react';

const Footer = (): JSX.Element => {
  const footerSections = [
    {
      title: 'Product',
      links: ['Features', 'Integrations', 'Pricing'],
    },
    {
      title: 'Company',
      links: ['About us', 'Blog', 'Careers', 'Customers', 'Brand'],
    },
    {
      title: 'Resources',
      links: ['Community', 'Contact', 'DPA', 'Terms of service'],
    },
  ];

  return (
    <footer className="border-border border-t bg-white py-12">
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-start justify-between space-y-8 md:flex-row md:space-y-0">
          <div>
            <p className="text-muted-foreground font-medium">More Comfortable.</p>
            <p className="text-muted-foreground font-medium">More Clean.</p>
          </div>

          <div className="flex flex-col space-y-8 md:flex-row md:space-y-0 md:space-x-16">
            {footerSections.map((section, index) => (
              <div key={index}>
                <h4 className="text-foreground mb-4 font-semibold">{section.title}</h4>
                <ul className="space-y-2">
                  {section.links.map((link, linkIndex) => (
                    <li key={linkIndex}>
                      <a
                        href="#"
                        className="text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {link}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="border-border mt-12 border-t pt-8 text-center">
          <p className="text-muted-foreground">
            &copy; {new Date().getFullYear()} Zomujo. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
