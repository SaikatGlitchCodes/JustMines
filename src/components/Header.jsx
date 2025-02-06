import { SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/clerk-react'
import React, { useState } from 'react'
import Engine from './Engine'

export default function Header() {
    const [showProfile, setShowProfile] = useState(false);

    return (
        <>
            <div className='flex items-center justify-end w-full p-4 mb-4 text-white bg-gray-800 gap-x-10'>
                <Engine />
                <SignedOut>
                    <SignInButton />
                </SignedOut>
                <SignedIn>
                    <button onClick={() => setShowProfile(!showProfile)}>
                        <UserButton afterSignOutUrl="/" />
                    </button>
                </SignedIn>
            </div>
        </>
    )
}
