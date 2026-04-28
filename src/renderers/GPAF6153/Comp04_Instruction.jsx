import React from 'react';

const styles = {
  container: {
    fontFamily: '"Times New Roman", Times, serif',
    padding: '40px',
    background: '#fff',
    color: '#000',
    width: '100%',
    boxSizing: 'border-box',
    fontSize: '13px',
    lineHeight: '1.4'
  },
  headerWrapper: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    borderBottom: '2px solid #000',
    paddingBottom: '10px',
    marginBottom: '10px'
  },
  headerLeft: {
    width: '35%',
    lineHeight: '1.5'
  },
  headerCenter: {
    width: '20%',
    display: 'flex',
    justifyContent: 'center'
  },
  headerRight: {
    width: '35%',
    textAlign: 'right',
    lineHeight: '1.5'
  },
  titleRight: {
    fontSize: '18px',
    fontWeight: 'bold',
    marginBottom: '5px'
  },
  boxLabel: {
    display: 'inline-block',
    border: '2px solid #000',
    padding: '2px 8px',
    fontWeight: 'bold',
    fontSize: '14px',
    marginBottom: '10px',
    marginRight: '15px'
  },
  gridRow: {
    display: 'flex',
    justifyContent: 'space-between'
  },
  descriptionLine: {
    display: 'flex',
    marginBottom: '20px'
  },
  descLabel: {
    width: '120px'
  },
  descValue: {
    fontWeight: 'normal'
  },
  instructionBlock: {
    marginBottom: '15px'
  },
  instructionTitle: {
    fontWeight: 'bold',
    fontSize: '14px',
    textDecoration: 'underline',
    textUnderlineOffset: '2px',
    marginBottom: '5px'
  },
  instructionContent: {
    marginLeft: '20px'
  },
  footerLine: {
    display: 'flex',
    justifyContent: 'space-between',
    marginTop: '60px',
    fontSize: '11px',
    color: '#333'
  },
  divider: {
    borderBottom: '1px solid #000',
    margin: '10px 0 15px 0'
  }
};

export default function Comp04_Instruction_GPAF6153({ extraction }) {
  const data = extraction?.data || {};
  const header = data.header || {};
  const instructions = data.instructions || [];
  const footer = data.footer || {};

  return (
    <div style={styles.container}>
      
      {/* Header Section */}
      <div style={styles.headerWrapper}>
        <div style={styles.headerLeft}>
          <div style={styles.gridRow}>
            <span>CUSTOMER CODE</span><span>: {header.customerCode || "A & F"}</span>
          </div>
          <div style={styles.gridRow}>
            <span>CUSTOMER STYLE</span><span>: {header.customerStyle || "122260171 (122260171)"}</span>
          </div>
          <div style={styles.gridRow}>
            <span>QUANTITY</span><span>: {header.quantity || "1500 PCS"}</span>
          </div>
        </div>
        
        <div style={styles.headerCenter}>
          {/* Small Hoodie Sketch Placeholder */}
          <svg width="40" height="60" viewBox="0 0 100 150">
            <path d="M 30 20 L 50 10 L 70 20 L 90 40 L 90 120 L 80 140 L 20 140 L 10 120 L 10 40 Z" fill="#eaeaea" stroke="#333" strokeWidth="2" />
            <path d="M 30 20 L 50 40 L 70 20" fill="none" stroke="#333" strokeWidth="2" />
            <rect x="35" y="80" width="30" height="20" fill="none" stroke="#333" strokeWidth="1" />
          </svg>
        </div>
        
        <div style={styles.headerRight}>
          <div style={styles.titleRight}>P.S. - Prod Instruction</div>
          <div style={styles.boxLabel}>{header.factoryNumber || "GPAF6153"}</div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '30px', textAlign: 'left', width: '150px', marginLeft: 'auto' }}>
            <div style={{ width: '80px' }}>
              <div>PAGES</div>
              <div>ORDER DATE</div>
              <div>EX FTY DATE</div>
            </div>
            <div>
              <div>: {header.pages || "1 / 1"}</div>
              <div>: {header.orderDate || "2026.02.26"}</div>
              <div>: {header.exFtyDate || "2026.05.07"}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Description */}
      <div style={styles.descriptionLine}>
        <div style={styles.descLabel}>DESCRIPTION</div>
        <div style={styles.descValue}>{header.description || "MEN'S 70% COTTON 30% POLYESTER\nKNITTED PULLOVER"}</div>
      </div>

      {/* Instructions Blocks */}
      {instructions.map((inst, idx) => (
        <div key={idx} style={styles.instructionBlock}>
          <div style={styles.instructionTitle}>{inst.title}</div>
          <div style={styles.instructionContent}>
            {inst.content && inst.content.map((line, lIdx) => {
              // Highlight the wavy hem warning specifically as per the visual
              const isWarning = line.includes("波浪效果") || line.includes("***");
              return (
                <div key={lIdx} style={{ fontWeight: isWarning ? 'bold' : 'normal', marginTop: isWarning ? '15px' : '2px' }}>
                  {line}
                </div>
              );
            })}
          </div>
          {/* Specific horizontal lines appear after certain instructions */}
          {(inst.title?.includes("1") || inst.title?.includes("2") || inst.title?.includes("3") || inst.title?.includes("4")) && (
             <div style={styles.divider}></div>
          )}
        </div>
      ))}

      {/* Footer */}
      <div style={styles.footerLine}>
        <span>Status: {footer.status || "T2YM"}</span>
        <span>EDIT BY {footer.editBy || "MMEYLY.HONG DATE 2026/02/26 TIME 16:11:54"}</span>
        <span>PRINT BY {footer.printBy || "MMEYLY.HONG DATE 2026/03/25 TIME 08:30:11"}</span>
      </div>

    </div>
  );
}
