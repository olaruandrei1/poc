import { useParams } from 'react-router-dom';

const AuctionDetailPage = () => {
    const { id } = useParams<{ id: string }>();

    return (
        <div style={{ padding: '60px 24px', maxWidth: 1200, margin: '0 auto' }}>
            <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: '2rem' }}>
                Auction Detail — {id}
            </h1>
            <p style={{ color: 'var(--text-secondary)', marginTop: 12 }}>
                Coming in next batch (BidModal, AutoBidModal, BidHistoryPanel, live sync).
            </p>
        </div>
    );
};

export default AuctionDetailPage;