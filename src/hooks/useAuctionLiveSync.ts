// src/hooks/useAuctionLiveSync.ts
import { useEffect } from 'react';
import { wsService } from '../services/wsService';
import { useAuctionStore } from '../store/auctionStore';
import type { Bid } from '../types/auction';

interface UseAuctionLiveSyncOptions {
    auctionId?: string;
    currentUserId?: string;
}


export const useAuctionLiveSync = ({ auctionId, currentUserId }: UseAuctionLiveSyncOptions = {}) => {
    const updateCurrentPriceLive = useAuctionStore((s) => s.updateCurrentPriceLive);
    const extendAuctionLive = useAuctionStore((s) => s.extendAuctionLive);
    const endAuctionLive = useAuctionStore((s) => s.endAuctionLive);
    const markOutbid = useAuctionStore((s) => s.markOutbid);
    const currentAuction = useAuctionStore((s) => s.currentAuction);

    useEffect(() => {
        const matches = (eventItemId: string) => !auctionId || eventItemId === auctionId;

        const offNewBid = wsService.on('auction_new_bid', (event) => {
            if (!matches(event.itemId)) return;
            const payload = event.payload as { bid: Bid; newCurrentPrice: number } | undefined;
            if (!payload?.bid) return;

            if (
                currentUserId &&
                currentAuction?.id === event.itemId &&
                currentAuction.highestBidderId === currentUserId &&
                payload.bid.bidderId !== currentUserId
            ) {
                markOutbid(event.itemId);
            }

            updateCurrentPriceLive(event.itemId, payload.newCurrentPrice, payload.bid);
        });

        const offExtended = wsService.on('auction_extended', (event) => {
            if (!matches(event.itemId)) return;
            const payload = event.payload as { addMinutes: number } | undefined;
            const minutes = payload?.addMinutes ?? 1;

            const auction =
                currentAuction?.id === event.itemId
                    ? currentAuction
                    : useAuctionStore.getState().auctions.find((a) => a.id === event.itemId);

            if (!auction) return;
            const newEnd = new Date(new Date(auction.endsAt).getTime() + minutes * 60_000);
            extendAuctionLive(event.itemId, newEnd.toISOString());
        });

        const offEnded = wsService.on('auction_ended', (event) => {
            if (!matches(event.itemId)) return;
            endAuctionLive(event.itemId);
        });

        const offOutbid = wsService.on('auction_outbid', (event) => {
            if (!matches(event.itemId)) return;
            markOutbid(event.itemId);
        });

        return () => {
            offNewBid();
            offExtended();
            offEnded();
            offOutbid();
        };
    }, [
        auctionId,
        currentUserId,
        currentAuction,
        updateCurrentPriceLive,
        extendAuctionLive,
        endAuctionLive,
        markOutbid,
    ]);
};