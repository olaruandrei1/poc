import { useNavigate } from 'react-router-dom';
import { GlassCard } from './GlassCard';
import styles from './WatchedAuctionsSection.module.css';
import { useAuctionStore } from '../../../../store/auctionStore';
import CountdownTimer from '../../../../components/atoms/CountdownTimer/CountdownTimer';

export const WatchedAuctionsSection = () => {
    const navigate = useNavigate();
    const watchedIds = useAuctionStore((s) => s.watchedAuctionIds);
    const auctions = useAuctionStore((s) => s.auctions);
    const watched = auctions.filter((a) => watchedIds.includes(a.id));

    return (
        <div className={styles.wrapper}>
            <h2 className={styles.title}>Watched Auctions</h2>
            {watched.length === 0 ? (
                <GlassCard>
                    <div className={styles.empty}>
                        <span>☆</span>
                        <p>No watched auctions yet.</p>
                        <button className={styles.browseBtn} onClick={() => navigate('/auctions')}>
                            Browse Auctions
                        </button>
                    </div>
                </GlassCard>
            ) : (
                <div className={styles.list}>
                    {watched.map((a) => (
                        <GlassCard key={a.id} className={styles.card} onClick={() => navigate(`/auctions/${a.id}`)}>
                            <img src={a.productImage} alt={a.productName} className={styles.img} />
                            <div className={styles.info}>
                                <span className={styles.brand}>{a.productBrand}</span>
                                <span className={styles.name}>{a.productName}</span>
                                <span className={styles.meta}>{a.colorway} · Size {a.size}</span>
                            </div>
                            <div className={styles.right}>
                                <span className={styles.price}>${a.currentPrice}</span>
                                <span className={styles.bids}>{a.bidCount} bids</span>
                                <CountdownTimer endsAt={a.endsAt} size="sm" />
                            </div>
                        </GlassCard>
                    ))}
                </div>
            )}
        </div>
    );
};