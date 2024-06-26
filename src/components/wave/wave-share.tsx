import Link from 'next/link';
import cn from 'clsx';
import { Popover } from '@headlessui/react';
import { AnimatePresence, motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { useAuth } from '@lib/context/auth-context';
import { manageBookmark } from '@lib/firebase/utils';
import { preventBubbling } from '@lib/utils';
import { siteURL } from '@lib/env';
import { Button } from '@components/ui/button';
import { HeroIcon } from '@components/ui/hero-icon';
import { ToolTip } from '@components/ui/tooltip';
import { variants } from './wave-actions';

type WaveShareProps = {
  userId: string;
  waveId: string;
  viewWave?: boolean;
};

export function WaveShare({
  userId,
  waveId,
  viewWave
}: WaveShareProps): JSX.Element {
  const { userBookmarks } = useAuth();

  const handleBookmark =
    (closeMenu: () => void, ...args: Parameters<typeof manageBookmark>) =>
    async (): Promise<void> => {
      const [type] = args;

      closeMenu();
      await manageBookmark(...args);

      toast.success(
        type === 'bookmark'
          ? (): JSX.Element => (
              <span className='flex gap-2'>
                Wave added to your Bookmarks
                <Link href='/bookmarks'>
                  <a className='custom-underline font-bold'>View</a>
                </Link>
              </span>
            )
          : 'Wave removed from your bookmarks'
      );
    };

  const handleCopy = (closeMenu: () => void) => async (): Promise<void> => {
    closeMenu();
    await navigator.clipboard.writeText(`${siteURL}/wave/${waveId}`);
    toast.success('Copied to clipboard');
  };

  const waveIsBookmarked = !!userBookmarks?.some(({ id }) => id === waveId);

  return (
    <Popover className='relative'>
      {({ open, close }): JSX.Element => (
        <>
          <Popover.Button
            className={cn(
              `group relative flex items-center gap-1 p-0 outline-none 
               transition-none hover:text-accent-indigo focus-visible:text-accent-indigo`,
              open && 'text-accent-indigo inner:bg-accent-indigo/10'
            )}
          >
            <i
              className='relative rounded-full p-2 not-italic duration-200 group-hover:bg-accent-indigo/10 
                         group-focus-visible:bg-accent-indigo/10 group-focus-visible:ring-2 
                         group-focus-visible:ring-accent-indigo/80 group-active:bg-accent-indigo/20'
            >
              <HeroIcon
                className={viewWave ? 'h-6 w-6' : 'h-5 w-5'}
                iconName='ArrowUpTrayIcon'
              />
              {!open && <ToolTip tip='Share' />}
            </i>
          </Popover.Button>
          <AnimatePresence>
            {open && (
              <Popover.Panel
                className='menu-container group absolute right-0 top-11 whitespace-nowrap text-light-primary dark:text-dark-primary'
                as={motion.div}
                {...variants}
                static
              >
                <Popover.Button
                  className='accent-tab flex w-full gap-3 rounded-md rounded-b-none p-4 hover:bg-main-sidebar-background'
                  as={Button}
                  onClick={preventBubbling(handleCopy(close))}
                >
                  <HeroIcon iconName='LinkIcon' />
                  Copy link to Wave
                </Popover.Button>
                {!waveIsBookmarked ? (
                  <Popover.Button
                    className='accent-tab flex w-full gap-3 rounded-md rounded-t-none p-4 hover:bg-main-sidebar-background'
                    as={Button}
                    onClick={preventBubbling(
                      handleBookmark(close, 'bookmark', userId, waveId)
                    )}
                  >
                    <HeroIcon iconName='BookmarkIcon' />
                    Bookmark
                  </Popover.Button>
                ) : (
                  <Popover.Button
                    className='accent-tab flex w-full gap-3 rounded-md rounded-t-none p-4 hover:bg-main-sidebar-background'
                    as={Button}
                    onClick={preventBubbling(
                      handleBookmark(close, 'unbookmark', userId, waveId)
                    )}
                  >
                    <HeroIcon iconName='BookmarkSlashIcon' />
                    Remove Wave from Bookmarks
                  </Popover.Button>
                )}
              </Popover.Panel>
            )}
          </AnimatePresence>
        </>
      )}
    </Popover>
  );
}
