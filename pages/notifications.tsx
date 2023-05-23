import { clientDb, serverDb } from "@/lib/db";
import { Notification } from "@/models/Notification";
import { Profile } from "@/models/Profile";
import { Loader } from "@mantine/core";
import { GetServerSidePropsContext } from "next";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

interface NotificationsPageProps
{
    profile: Profile;
}

export default function NotificationsPage({ profile }: NotificationsPageProps)
{
    const [newNotifications, setNewNotifications] = useState<Notification[]>();
    const [oldNotifications, setOldNotifications] = useState<Notification[]>();


    useEffect(() => {
        clientDb.from('notifications').select('*').eq('userId', profile.id).then(async res => {
            if (!res.error && res.data)
            {
                const notifications = res.data as Notification[];
                setNewNotifications(notifications.filter(n => !n.seen));
                setOldNotifications(notifications.filter(n => n.seen));
            }
        });
    }, []);

    return <div className="w-full h-full flex flex-col gap-10 max-w-3xl p-24 mx-auto">
        <Link href='/' className="flex flex-col items-center justify-center mb-10">
            <Image src='/logo.png' width={500} height={450} alt='Gehenna' />
            <span className="text-sm mr-auto pt-2">Click To Go Back</span>
        </Link>
        <h1 className="text-4xl font-bold">Notifications</h1>
        <div className="flex flex-col gap-4">
            <span className="text-2xl font-semibold w-full">New Notifications</span>
            {
                !newNotifications &&
                <div className="flex w-full h-14 items-center justify-center">
                    <Loader />
                </div>
            }
            {
                newNotifications && newNotifications.length === 0 &&
                <div className="flex w-full h-14 items-center justify-center">
                    <span className="text-lg font-semibold">No notifications.</span>
                </div>
            }
            {
                newNotifications &&
                newNotifications.map((notification, index) => {
                    return (
                        <Link key={index} href={notification.link} className='w-full flex flex-col gap-2 p-2 px-4 bg-tertiary rounded-xl transition hover:bg-primary hover:text-secondary group border-b-2 border-b-primary'
                        onClick={async () => {
                            // Let the system know that we've clicked and viewed this post.
                            const res = await clientDb.from('notifications').update({
                                seen: true
                            }).eq('id', notification.id);
                        }}>
                            <span className='text-lg font-semibold'>{notification.title}</span>
                            <span className='text-xs'>{notification.text}</span>
                            <span className='text-xs text-primary ml-auto group-hover:text-secondary'>{new Date(notification.created_at).toLocaleDateString('en-au', { weekday: 'long', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
                        </Link>
                    )
                })
            }
        </div>
        <div className="flex flex-col gap-4">
            <span className="text-2xl font-semibold w-full">Old Notifications</span>
            {
                !oldNotifications &&
                <div className="flex w-full h-14 items-center justify-center">
                    <Loader />
                </div>
            }
            {
                oldNotifications && oldNotifications.length === 0 &&
                <div className="flex w-full h-14 items-center justify-center">
                    <span className="text-lg font-semibold">No notifications.</span>
                </div>
            }
            {
                oldNotifications &&
                oldNotifications.map((notification, index) => {
                    return (
                        <Link key={index} href={notification.link} className='w-full flex flex-col gap-2 p-2 px-4 bg-tertiary rounded-xl transition hover:bg-primary hover:text-secondary group border-b-2 border-b-primary'
                        onClick={async () => {
                            // Let the system know that we've clicked and viewed this post.
                            const res = await clientDb.from('notifications').update({
                                seen: true
                            }).eq('id', notification.id);
                        }}>
                            <span className='text-lg font-semibold'>{notification.title}</span>
                            <span className='text-xs'>{notification.text}</span>
                            <span className='text-xs text-primary ml-auto group-hover:text-secondary'>{new Date(notification.created_at).toLocaleDateString('en-au', { weekday: 'long', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
                        </Link>
                    )
                })
            }
        </div>
    </div>
}

export const getServerSideProps = async (context: GetServerSidePropsContext) => 
{
	const db = serverDb(context);
	const user = (await db.auth.getUser()).data.user;

    if (!user)
    {
        return {
            redirect: {
                destination: '/',
                permanent: false
            }
        }
    }

	if (user)
	{
		// Get the profile.
		const profile = (await db.from('profiles').select('*').eq('id', user.id).single()).data as Profile;
		return {
			props: {
				user: user,
				profile: profile
			}
		}
	}

	return {
		props: {
			user: user
		}
	}
}