import os
import sys
import shutil
import numpy as np

from subprocess import call
from PIL import Image
from models import load_model
from lib.config import cfg, cfg_from_list
from lib.solver import Solver
from lib.voxel import voxel2obj
from os.path import isfile, join

def load_input_images(folder):
    ims = []
    files = [f for f in os.listdir(folder) if isfile(join(folder, f))]
    for f in files:
        im = Image.open(join(folder, f))
        ims.append([np.array(im).transpose((2, 0, 1)).astype(np.float32) / 255.])
    return np.array(ims)

def main():
    '''Main demo function'''
    
    # load images
    input_folder_name = sys.argv[1] if len(sys.argv) > 1 else 'in_demo'
    imgs = load_input_images(input_folder_name)
    
    # get output file name from command line argument
    output_file_name = sys.argv[2] if len(sys.argv) > 2 else 'demo.obj'
    
    # use the default network model
    NetClass = load_model('ResidualGRUNet')
    net = NetClass(compute_grad = False)
    net.load('output/ResidualGRUNet/default_model/weights.npy')
    solver = Solver(net)
    
    # run the network
    voxel_prediction, _ = solver.test_output(imgs)
    
    # save the prediction to an OBJ (mesh) file
    voxel2obj(output_file_name, voxel_prediction[0, :, 1, :, :] > cfg.TEST.VOXEL_THRESH)

if __name__ == '__main__':
    # Set the batch size to 1
    cfg_from_list(['CONST.BATCH_SIZE', 1])
    main()