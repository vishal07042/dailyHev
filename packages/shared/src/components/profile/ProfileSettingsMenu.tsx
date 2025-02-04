import React, { ReactElement, useCallback, useMemo } from 'react';
import {
  AddUserIcon,
  BellIcon,
  CardIcon,
  EditIcon,
  LockIcon,
  DevCardIcon,
  ExitIcon,
  EmbedIcon,
  DocsIcon,
  TerminalIcon,
  FeedbackIcon,
  HammerIcon,
  AppIcon,
  DevPlusIcon,
} from '../icons';
import { NavDrawer } from '../drawers/NavDrawer';
import {
  docs,
  feedback,
  managePlusUrl,
  plusUrl,
  privacyPolicy,
  termsOfService,
} from '../../lib/constants';
import { useLazyModal } from '../../hooks/useLazyModal';
import { LazyModal } from '../modals/common/types';
import { anchorDefaultRel } from '../../lib/strings';
import type { NavItemProps } from '../drawers/NavDrawerItem';
import { LogoutReason } from '../../lib/user';
import { useAuthContext } from '../../contexts/AuthContext';
import { usePrompt } from '../../hooks/usePrompt';
import { ButtonColor } from '../buttons/Button';
import { usePlusSubscription } from '../../hooks/usePlusSubscription';
import { LogEvent, TargetId } from '../../lib/log';
import { GooglePlayIcon } from '../icons/Google/Play';
import { checkIsBrowser, isAndroidApp, UserAgent } from '../../lib/func';
import { useConditionalFeature } from '../../hooks';
import { feature } from '../../lib/featureManagement';

const useMenuItems = (): NavItemProps[] => {
  const { logout } = useAuthContext();
  const { openModal } = useLazyModal();
  const { showPrompt } = usePrompt();
  const { showPlusSubscription, isPlus, logSubscriptionEvent } =
    usePlusSubscription();
  const { value: appExperiment } = useConditionalFeature({
    feature: feature.onboardingAndroid,
    shouldEvaluate: checkIsBrowser(UserAgent.Android) && !isAndroidApp(),
  });

  const onLogout = useCallback(async () => {
    const shouldLogout = await showPrompt({
      title: 'Are you sure?',
      className: { buttons: 'mt-5 flex-col-reverse' },
      okButton: { title: 'Logout', color: ButtonColor.Ketchup },
    });

    if (shouldLogout) {
      logout(LogoutReason.ManualLogout);
    }
  }, [logout, showPrompt]);

  return useMemo(() => {
    const plusItem = showPlusSubscription
      ? {
          label: isPlus ? 'Manage plus' : 'Upgrade to plus',
          icon: <DevPlusIcon />,
          href: isPlus ? managePlusUrl : plusUrl,
          className: isPlus ? undefined : 'text-action-plus-default',
          target: isPlus ? '_blank' : undefined,
          onClick: () => {
            logSubscriptionEvent({
              event_name: isPlus
                ? LogEvent.ManageSubscription
                : LogEvent.UpgradeSubscription,
              target_id: TargetId.ProfileDropdown,
            });
          },
        }
      : undefined;

    const downloadAndroidApp = appExperiment
      ? {
          label: 'Download mobile app',
          icon: <GooglePlayIcon />,
          href: process.env.NEXT_PUBLIC_ANDROID_APP,
          target: '_blank',
          rel: anchorDefaultRel,
        }
      : undefined;

    return [
      {
        label: 'Profile',
        isHeader: true,
      },
      { label: 'Edit profile', icon: <EditIcon />, href: '/account/profile' },
      plusItem,
      {
        label: 'Invite friends',
        icon: <AddUserIcon />,
        href: '/account/invite',
      },
      { label: 'Devcard', icon: <DevCardIcon />, href: '/devcard' },
      {
        label: 'Logout',
        icon: <ExitIcon />,
        onClick: onLogout,
      },
      {
        label: 'Manage',
        isHeader: true,
      },
      {
        label: 'Customize',
        icon: <CardIcon />,
        onClick: () => openModal({ type: LazyModal.UserSettings }),
      },
      { label: 'Security', icon: <LockIcon />, href: '/account/security' },
      {
        label: 'Notifications',
        icon: <BellIcon />,
        href: '/account/notifications',
      },
      {
        label: 'Integrations',
        icon: <AppIcon />,
        href: '/account/integrations',
      },
      {
        label: 'Contribute',
        isHeader: true,
      },
      {
        label: 'Community picks',
        icon: <DocsIcon />,
        onClick: () => openModal({ type: LazyModal.SubmitArticle }),
      },
      {
        label: 'Suggest new source',
        icon: <EmbedIcon />,
        onClick: () => openModal({ type: LazyModal.NewSource }),
      },
      {
        label: 'Support',
        isHeader: true,
      },
      downloadAndroidApp,
      {
        label: 'Docs',
        icon: <DocsIcon />,
        href: docs,
        target: '_blank',
        rel: anchorDefaultRel,
      },
      {
        label: 'Changelog',
        icon: <TerminalIcon />,
        href: '/sources/daily_updates',
      },
      {
        label: 'Feedback',
        icon: <FeedbackIcon />,
        href: feedback,
        target: '_blank',
        rel: anchorDefaultRel,
      },
      {
        label: 'Privacy policy',
        icon: <DocsIcon />,
        href: privacyPolicy,
        target: '_blank',
        rel: anchorDefaultRel,
      },
      {
        label: 'Terms of service',
        icon: <HammerIcon />,
        href: termsOfService,
        target: '_blank',
        rel: anchorDefaultRel,
      },
    ].filter(Boolean);
  }, [
    isPlus,
    logSubscriptionEvent,
    onLogout,
    openModal,
    showPlusSubscription,
    appExperiment,
  ]);
};

interface ProfileSettingsMenuProps {
  isOpen: boolean;
  onClose?: () => void;
  shouldKeepOpen?: boolean;
}

export function ProfileSettingsMenu({
  isOpen,
  onClose,
  shouldKeepOpen,
}: ProfileSettingsMenuProps): ReactElement {
  return (
    <NavDrawer
      header="Settings"
      shouldKeepOpen={shouldKeepOpen}
      drawerProps={{
        isOpen,
        onClose,
      }}
      items={useMenuItems()}
    />
  );
}

export default ProfileSettingsMenu;
