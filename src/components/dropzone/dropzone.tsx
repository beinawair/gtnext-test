import React from 'react'
import './dropzone.scss'
import UploadFileImg from '../assets/img/image-upload.svg'
import { NextPage } from "next";

export type DropzoneFileProps = {
}

export const DropzoneFile: NextPage<DropzoneFileProps> = ({
}) => {
  const readFiles = (files: FileList) => {
    const filesData: (string | ArrayBuffer)[] = []
    for (var i = 0;i < files.length;i++) {
      const reader = new FileReader();
      reader.onload = function (event) {
        if (event?.target?.result)
          filesData.push(event.target.result);
      }
      reader.readAsDataURL(files[i]);
    }
    return filesData
  }

  const DropzoneElement = ({ children }: { children: JSX.Element }) => {
    
    const preventDefaults = (e: Event)=> {
      e.preventDefault()
      e.stopPropagation()
    }
    

    let dropzoneElement = <div className="dropzone">{children}</div> as any
    if (dropzoneElement) {
      const highlight = (e: Event) => {
        dropzoneElement!.classList.add('active')
      }

      const unHighlight = (e: Event) => {
        dropzoneElement!.classList.remove('active')
      }
        
      const handleDrop = (e:any) => {
        var dt = e.dataTransfer
        var files = dt.files

        readFiles(files)
      }

        ;['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
          dropzoneElement!.addEventListener(eventName, preventDefaults, false);
        })
        ;['dragenter', 'dragover'].forEach(eventName => {
          dropzoneElement!.addEventListener(eventName, highlight, false);
        })
        ;['dragleave', 'drop'].forEach(eventName => {
          dropzoneElement!.addEventListener(eventName, unHighlight, false);
        })
      
      dropzoneElement!.addEventListener('drop', handleDrop, false);
    }
    return dropzoneElement
  }

  return (
    <>
      <DropzoneElement>
        <form action='#'>
          <img className="d-block mx-auto" src={UploadFileImg} alt="image-upload" width={256} />
          <p>Drag and drop or choose file here</p>
          <input type="file" id="fileElem" multiple accept="image/*" />
        </form>
      </DropzoneElement>
    </>
  )
}